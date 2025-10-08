import { db } from '../db/db';

const LIBRARY_SOURCE_ID = 1; // Assuming a single local library source for now

/**
 * Stores a directory handle in IndexedDB for persistent access.
 * @param handle The FileSystemDirectoryHandle to store.
 */
async function storeDirectoryHandle(
  handle: FileSystemDirectoryHandle
): Promise<void> {
  await db.librarySources.put({
    id: LIBRARY_SOURCE_ID,
    type: 'local',
    name: 'Local SSD',
    handle: handle,
  });
}

/**
 * Retrieves a stored directory handle from IndexedDB.
 * @returns The stored FileSystemDirectoryHandle or null if not found.
 */
async function getStoredDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  const source = await db.librarySources.get(LIBRARY_SOURCE_ID);
  return source?.handle ?? null;
}

/**
 * Prompts the user to pick a directory and stores the handle for future use.
 * Verifies permissions on subsequent loads.
 * @returns The FileSystemDirectoryHandle for the selected directory.
 */
export async function getDirectoryHandle(): Promise<FileSystemDirectoryHandle> {
  let handle = await getStoredDirectoryHandle();

  if (handle) {
    // Verify permission for the stored handle
    const options: FileSystemHandlePermissionDescriptor = { mode: 'readwrite' };
    if ((await handle.queryPermission(options)) === 'granted') {
      return handle;
    }
    if ((await handle.requestPermission(options)) === 'granted') {
      return handle;
    }
    // If permission is denied, we'll fall through and ask the user to pick a new directory.
  }

  // If no handle is stored or permission was denied, prompt the user to pick a new one.
  handle = await window.showDirectoryPicker({
    mode: 'readwrite',
    startIn: 'music',
  });

  if (!handle) {
    throw new Error('No directory selected.');
  }

  await storeDirectoryHandle(handle);
  return handle;
}

/**
 * Asynchronously walks through a directory and its subdirectories, yielding file handles.
 * @param dirHandle The FileSystemDirectoryHandle to start from.
 * @returns An async generator that yields [FileSystemFileHandle, relativePath].
 */
export const AUDIO_EXTENSIONS = [
  '.mp3', '.wav', '.ogg', '.flac', '.aiff', '.aif',
];

export async function* walkDirectory(
  dirHandle: FileSystemDirectoryHandle,
  parentPath = ''
): AsyncGenerator<[FileSystemFileHandle, string]> {
  for await (const entry of dirHandle.values()) {
    const relativePath = `${parentPath}${parentPath ? '/' : ''}${entry.name}`;
    if (entry.kind === 'file') {
      const fileExtension = `.${entry.name.split('.').pop()?.toLowerCase()}`;
      if (AUDIO_EXTENSIONS.includes(fileExtension)) {
        // We need to request the handle again to get a FileSystemFileHandle
        const fileHandle = await dirHandle.getFileHandle(entry.name);
        yield [fileHandle, relativePath];
      }
    } else if (entry.kind === 'directory') {
      const subDirHandle = await dirHandle.getDirectoryHandle(entry.name);
      yield* walkDirectory(subDirHandle, relativePath);
    }
  }
}

/**
 * Retrieves a FileSystemFileHandle from a relative path within a root directory handle.
 * @param rootHandle The root directory handle.
 * @param relativePath The relative path to the file.
 * @returns The FileSystemFileHandle.
 */
export async function getFileHandleFromPath(
  rootHandle: FileSystemDirectoryHandle,
  relativePath: string
): Promise<FileSystemFileHandle> {
  const pathParts = relativePath.split('/');
  const fileName = pathParts.pop();
  if (!fileName) {
    throw new Error('Invalid relative path');
  }

  let currentDirHandle: FileSystemDirectoryHandle = rootHandle;
  for (const part of pathParts) {
    currentDirHandle = await currentDirHandle.getDirectoryHandle(part);
  }
  return await currentDirHandle.getFileHandle(fileName);
}

/**
 * Moves a file from a source handle to a target path within a root directory.
 * This is a simplified move. A robust implementation is needed in the "Move Engine".
 * @param rootHandle The root directory handle.
 * @param sourceFileHandle The file handle of the file to move.
 * @param targetPath The destination path, relative to the root handle.
 */
export async function moveFile(
  rootHandle: FileSystemDirectoryHandle,
  sourceFileHandle: FileSystemFileHandle,
  targetPath: string
): Promise<void> {
  const pathParts = targetPath.split('/');
  const fileName = pathParts.pop();
  if (!fileName) {
    throw new Error('Invalid target path');
  }

  let currentDirHandle = rootHandle;
  for (const part of pathParts) {
    currentDirHandle = await currentDirHandle.getDirectoryHandle(part, {
      create: true,
    });
  }

  const newFileHandle = await currentDirHandle.getFileHandle(fileName, {
    create: true,
  });
  const writable = await newFileHandle.createWritable();
  const file = await sourceFileHandle.getFile();
  await writable.write(file);
  await writable.close();

  // This is not a real move, it's a copy. The "Move Engine" will need to delete the original.
  // For a true move, we would use sourceHandle.move(), but that has limitations across directories.
  // A robust solution would involve deleting the source file after successful copy.
}

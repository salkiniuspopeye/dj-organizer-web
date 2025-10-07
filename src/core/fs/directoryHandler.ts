const DIRECTORY_HANDLE_KEY = 'directoryHandle';

export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle) {
  try {
    // Check if the handle is valid and permissions are granted
    if (await verifyPermission(handle)) {
      // Store the handle in IndexedDB or localStorage (for simplicity, let's use localStorage for now)
      // Note: Storing FileSystemHandle directly in localStorage is not possible.
      // We need to store a reference that can be used to retrieve it.
      // The File System Access API provides a way to persist permissions,
      // but not the handle itself directly in localStorage.
      // For actual persistence, we'd need to use IndexedDB and store the name/path
      // and then re-request the handle, or use the `window.showDirectoryPicker`
      // with `startIn` option if we have a previous handle.

      // For now, let's just store a flag that a handle was selected.
      // The actual handle will be re-requested on app load.
      localStorage.setItem(DIRECTORY_HANDLE_KEY, 'true');
      console.log('Directory handle saved (flag only).');
    } else {
      console.warn('Permission not granted for directory handle.');
    }
  } catch (error) {
    console.error('Error saving directory handle:', error);
  }
}

export async function loadDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const hasHandle = localStorage.getItem(DIRECTORY_HANDLE_KEY);
    if (hasHandle === 'true') {
      // Attempt to re-request the handle. This will prompt the user if permissions are lost.
      const handle = await window.showDirectoryPicker();
      if (await verifyPermission(handle)) {
        console.log('Directory handle loaded.');
        return handle;
      } else {
        console.warn('Permission not granted for loaded directory handle.');
        localStorage.removeItem(DIRECTORY_HANDLE_KEY); // Clear flag if permission is lost
        return null;
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('User cancelled directory picker.');
    } else {
      console.error('Error loading directory handle:', error);
    }
    localStorage.removeItem(DIRECTORY_HANDLE_KEY); // Clear flag on error
  }
  return null;
}

async function verifyPermission(handle: FileSystemDirectoryHandle) {
  const options = {
    mode: 'readwrite' as FileSystemPermissionMode,
  };
  // Check if permission was already granted. If so, return true.
  if ((await handle.queryPermission(options)) === 'granted') {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  if ((await handle.requestPermission(options)) === 'granted') {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
}

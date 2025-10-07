import { db } from '../db/db';
import type { Track } from '../db/db';
import { buildTargetPath } from './pathBuilder';
import {
  getDirectoryHandle,
  moveFile as fsMoveFile,
  getFileHandleFromPath,
} from './fileSystem';
import {
  getDropboxClient,
  moveFile as dropboxMoveFile,
} from '../dropbox/dropbox';

export interface MovePlanItem {
  track: Track;
  sourcePath?: string;
  targetPath: string;
  conflict?: 'path_exists' | 'duplicate_content';
  conflictReason?: string;
}

export async function generateMovePlan(): Promise<MovePlanItem[]> {
  const tracksToProcess = await db.tracks
    .where('status')
    .anyOf(['unassigned', 'assigned'])
    .toArray();

  const planItems: MovePlanItem[] = [];
  const targetPathMap = new Map<string, Track>();
  const contentHashToTrackMap = new Map<string, Track>(); // To detect duplicate content

  for (const track of tracksToProcess) {
    let targetPath = '';
    try {
      // Assuming a fixed root directory name for now, e.g., 'Finished Tracks'
      // This should be configurable later.
      targetPath = buildTargetPath(track, 'Finished Tracks');
    } catch (error: any) {
      console.error(`Error building target path for track ${track.id}:`, error);
      // Mark track as error or skip
      continue;
    }

    const planItem: MovePlanItem = {
      track,
      sourcePath: track.source === 'local' ? track.path : track.dropboxPathLower || '',
      targetPath,
    };

    // Resolve path conflicts by adding a suffix
    let uniqueTargetPath = targetPath;
    let suffix = 1;
    while (targetPathMap.has(uniqueTargetPath)) {
      suffix++;
      const fileName = targetPath.substring(targetPath.lastIndexOf('/') + 1);
      const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
      const extension = fileName.substring(fileName.lastIndexOf('.'));
      uniqueTargetPath = `${targetPath.substring(0, targetPath.lastIndexOf('/'))}/${baseName} (${suffix})${extension}`;
    }
    planItem.targetPath = uniqueTargetPath;
    targetPathMap.set(uniqueTargetPath, track);

    // Check for duplicate content (size + mtime)
    if (track.size && track.mtime) {
      const contentHash = `${track.size}-${track.mtime}`;
      if (contentHashToTrackMap.has(contentHash) && targetPathMap.has(planItem.targetPath)) {
        planItem.conflict = 'duplicate_content';
        planItem.conflictReason = `A track with identical content (${contentHashToTrackMap.get(contentHash)?.name}) is already planned for this path.`;
      } else {
        contentHashToTrackMap.set(contentHash, track);
      }
    }

    planItems.push(planItem);
  }

  const movePlanId = `move-plan-${Date.now()}`;
  await db.movePlans.add({
    id: movePlanId,
    planItems: planItems,
    status: 'pending',
    createdAt: Date.now(),
  });

  return planItems;
}

export async function executeMovePlan(movePlanId: string, plan: MovePlanItem[], onProgress?: (progress: number, total: number, currentItem: MovePlanItem) => void, signal?: AbortSignal): Promise<void> {
  const rootHandle = await getDirectoryHandle(); // Get the root directory handle for local moves
  const dropboxClient = await getDropboxClient(); // Get Dropbox client for Dropbox moves

  let completed = 0;
  for (const item of plan) {
    if (signal?.aborted) {
      await db.movePlans.update(movePlanId, { status: 'cancelled' });
      throw new DOMException('Move operation aborted', 'AbortError');
    }

    if (item.conflict) {
      console.warn(`Skipping conflicted item: ${item.track.name} - ${item.conflictReason}`);
      completed++;
      onProgress?.(completed, plan.length, item);
      continue;
    }

    try {
      if (item.track.source === 'local') {
        if (!item.sourcePath) {
          console.warn(`Skipping local move for track ${item.track.name}: sourcePath is undefined.`);
          completed++;
          onProgress?.(completed, plan.length, item);
          continue;
        }
        const sourceFileHandle = await getFileHandleFromPath(rootHandle, item.sourcePath);
        await fsMoveFile(rootHandle, sourceFileHandle, item.targetPath);
        
        // Delete original file after successful copy
        const sourcePathParts = item.sourcePath.split('/');
        const sourceFileName = sourcePathParts.pop();
        if (!sourceFileName) {
          throw new Error('Could not determine source file name for deletion.');
        }
        const sourceParentPath = sourcePathParts.join('/');
        let sourceParentDirHandle: FileSystemDirectoryHandle;
        if (sourceParentPath) {
          sourceParentDirHandle = await rootHandle.getDirectoryHandle(sourceParentPath);
        } else {
          sourceParentDirHandle = rootHandle;
        }
        await sourceParentDirHandle.removeEntry(sourceFileName);

        console.log(`Moved local file: ${item.sourcePath} to ${item.targetPath}`);
      } else if (item.track.source === 'dropbox' && dropboxClient) {
        if (!item.sourcePath) {
          console.warn(`Skipping Dropbox move for track ${item.track.name}: sourcePath is undefined.`);
          completed++;
          onProgress?.(completed, plan.length, item);
          continue;
        }
        await dropboxMoveFile(dropboxClient, item.sourcePath, item.targetPath);
        console.log(`Moved Dropbox file: ${item.sourcePath} to ${item.targetPath}`);
      }
      await db.tracks.update(item.track.id, { status: 'moved', targetPath: item.targetPath });
    } catch (error) {
      console.error(`Error moving track ${item.track.name}:`, error);
      await db.tracks.update(item.track.id, { status: 'error', targetPath: item.targetPath });
    }

    completed++;
    onProgress?.(completed, plan.length, item);
  }

  await db.movePlans.update(movePlanId, { status: 'completed', completedAt: Date.now() });
}

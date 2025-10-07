import { db, type Track } from '../db/db';
import { buildTargetPath } from './pathBuilder';
import { getDirectoryHandle, moveFile as fsMoveFile, getFileHandleFromPath } from './fileSystem';
import { getDropboxClient, moveFile as dropboxMoveFile } from '../dropbox/dropbox';

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

  const plan: MovePlanItem[] = [];
  const targetPathMap = new Map<string, Track>(); // To detect path conflicts
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

    // Check for path conflicts
    if (targetPathMap.has(targetPath)) {
      planItem.conflict = 'path_exists';
      planItem.conflictReason = `Another track (${targetPathMap.get(targetPath)?.name}) is already planned for this path.`;
    } else {
      targetPathMap.set(targetPath, track);
    }

    // Check for duplicate content (size + mtime)
    if (track.size && track.mtime) {
      const contentHash = `${track.size}-${track.mtime}`;
      if (contentHashToTrackMap.has(contentHash) && targetPathMap.has(targetPath)) {
        planItem.conflict = 'duplicate_content';
        planItem.conflictReason = `A track with identical content (${contentHashToTrackMap.get(contentHash)?.name}) is already planned for this path.`;
      } else {
        contentHashToTrackMap.set(contentHash, track);
      }
    }

    plan.push(planItem);
  }

  return plan;
}

export async function executeMovePlan(plan: MovePlanItem[], onProgress?: (progress: number, total: number, currentItem: MovePlanItem) => void): Promise<void> {
  const rootHandle = await getDirectoryHandle(); // Get the root directory handle for local moves
  const dropboxClient = await getDropboxClient(); // Get Dropbox client for Dropbox moves

  let completed = 0;
  for (const item of plan) {
    if (item.conflict) {
      console.warn(`Skipping conflicted item: ${item.track.name} - ${item.conflictReason}`);
      continue;
    }

    try {
      if (item.track.source === 'local') {
        if (!item.sourcePath) {
          console.warn(`Skipping local move for track ${item.track.name}: sourcePath is undefined.`);
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
}

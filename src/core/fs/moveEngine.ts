import { db, Track } from '../db/db';
import { buildTargetPath } from './pathBuilder';
import { getDirectoryHandle, walkDirectory, moveFile as fsMoveFile } from './fileSystem';
import { getDropboxClient, moveFile as dropboxMoveFile } from '../dropbox/dropbox';

export interface MovePlanItem {
  track: Track;
  sourcePath: string;
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

    // TODO: Implement duplicate content detection (hash/size/mtime)
    // For now, we'll just add the item to the plan.
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
        // For local files, we need the actual FileSystemFileHandle
        // This is a simplified approach. A real implementation would need to find the handle from the rootHandle.
        // For now, we'll assume we can get the file content and write it to the new location.
        // This is a copy-then-delete strategy, not a true move.
        const sourceFile = await (await rootHandle.getFileHandle(item.sourcePath)).getFile();
        await fsMoveFile(rootHandle, sourceFile, item.targetPath);
        // TODO: Delete original file after successful copy
        console.log(`Moved local file: ${item.sourcePath} to ${item.targetPath}`);
      } else if (item.track.source === 'dropbox' && dropboxClient) {
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

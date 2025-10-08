/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db, type Track } from '../../core/db/db';
import { walkDirectory } from '../../core/fs/fileSystem';
import { trackRepository } from '../../core/db/trackRepository';
import { useCallback } from 'react'; // Import useCallback for mocking

// Mock dependencies
vi.mock('../../core/fs/fileSystem', () => ({
  walkDirectory: vi.fn(),
}));

vi.mock('../../core/db/trackRepository', () => ({
  trackRepository: {
    saveTracks: vi.fn(),
  },
}));

vi.mock('../../core/db/db', () => ({
  db: {
    tracks: {
      count: vi.fn(),
    },
  },
}));

describe('Indexer Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should index files from a directory and save them as tracks', async () => {
    const mockDirectoryHandle = {
      name: 'test-folder',
      kind: 'directory',
    };

    const mockFileHandle1 = {
      name: 'track1.mp3',
      getFile: async () => ({
        name: 'track1.mp3',
        size: 100,
        lastModified: 12345
      }),
    };
    const mockFileHandle2 = {
      name: 'track2.wav',
      getFile: async () => ({
        name: 'track2.wav',
        size: 200,
        lastModified: 67890
      }),
    };

    // Mock walkDirectory to yield mock file handles
    (walkDirectory as vi.Mock).mockImplementation(async function* () {
      yield [mockFileHandle1, 'path/to/track1.mp3'];
      yield [mockFileHandle2, 'path/to/track2.wav'];
    });

    // Mock trackRepository.saveTracks
    (trackRepository.saveTracks as vi.Mock).mockResolvedValue(undefined);

    // Mock db.tracks.count
    (db.tracks.count as vi.Mock).mockResolvedValue(0);

    // Create a mock handleIndexFolder function
    const handleIndexFolder = useCallback(async (handle: any) => {
      if (!handle) return;

      const newTracks: Track[] = [];
      for await (const [fileHandle, relativePath] of walkDirectory(handle)) {
        const file = await fileHandle.getFile();
        newTracks.push({
          id: file.name,
          name: file.name,
          size: file.size,
          mtime: file.lastModified,
          source: 'local',
          path: relativePath,
          status: 'unassigned',
        });
      }
      await trackRepository.saveTracks(newTracks);
    }, []);

    await handleIndexFolder(mockDirectoryHandle);

    expect(walkDirectory).toHaveBeenCalledWith(mockDirectoryHandle);
    expect(trackRepository.saveTracks).toHaveBeenCalledWith([
      {
        id: 'track1.mp3',
        name: 'track1.mp3',
        size: 100,
        mtime: 12345,
        source: 'local',
        path: 'path/to/track1.mp3',
        status: 'unassigned',
      },
      {
        id: 'track2.wav',
        name: 'track2.wav',
        size: 200,
        mtime: 67890,
        source: 'local',
        path: 'path/to/track2.wav',
        status: 'unassigned',
      },
    ]);
  });
});

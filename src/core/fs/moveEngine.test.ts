// @ts-nocheck
/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach } from 'vitest';
import * as Vitest from 'vitest';
import { generateMovePlan, executeMovePlan, type MovePlanItem } from './moveEngine';
import { db, type Track } from '../db/db';
import * as fileSystem from './fileSystem';
import * as dropbox from '../dropbox/dropbox';

// Mock the database
Vitest.vi.mock('../db/db', () => ({
  db: {
    tracks: {
      where: Vitest.vi.fn().mockReturnThis(),
      anyOf: Vitest.vi.fn().mockReturnThis(),
      toArray: Vitest.vi.fn(),
      update: Vitest.vi.fn(),
    },
    genres: {
      toArray: Vitest.vi.fn().mockResolvedValue([
        { id: 1, name: 'Techno' },
        { id: 2, name: 'House' },
      ]),
    },
  },
}));

// Mock fileSystem functions
Vitest.vi.mock('./fileSystem', () => ({
  getDirectoryHandle: Vitest.vi.fn(),
  walkDirectory: Vitest.vi.fn(),
  moveFile: Vitest.vi.fn(),
  getFileHandleFromPath: Vitest.vi.fn(),
}));

// Mock dropbox functions
Vitest.vi.mock('../dropbox/dropbox', () => ({
  getDropboxClient: Vitest.vi.fn(),
  listFiles: Vitest.vi.fn(),
  moveFile: Vitest.vi.fn(),
}));

describe('Move Engine', () => {
  beforeEach(() => {
    Vitest.vi.clearAllMocks();
    // Reset mock implementations for each test
    (db.tracks.toArray as Vitest.vi.Mock).mockResolvedValue([]);
    (db.tracks.update as Vitest.vi.Mock).mockResolvedValue(1);
    (fileSystem.getDirectoryHandle as Vitest.vi.Mock).mockResolvedValue({});
    (fileSystem.getFileHandleFromPath as Vitest.vi.Mock).mockResolvedValue({
      getFile: Vitest.vi.fn().mockResolvedValue({ size: 100, lastModified: Date.now() }),
      name: 'mockFile.mp3',
    });
    (dropbox.getDropboxClient as Vitest.vi.Mock).mockResolvedValue({});
  });

  describe('generateMovePlan', () => {
    it('should generate a plan for unassigned tracks', async () => {
      const mockTracks: Track[] = [
        {
          id: '1',
          name: 'Track 1.mp3',
          size: 100,
          mtime: 1678886400000,
          source: 'local',
          path: './Track 1.mp3',
          genre: 'Techno',
          mood: 'BANGER',
          status: 'unassigned',
        },
      ];
      (db.tracks.toArray as vi.Mock).mockResolvedValue(mockTracks);

      const plan = await generateMovePlan();

      expect(plan).toHaveLength(1);
      expect(plan[0].track).toEqual(mockTracks[0]);
      expect(plan[0].targetPath).toBe('Finished Tracks/Techno/BANGER/Track 1.mp3');
      expect(plan[0].conflict).toBeUndefined();
    });

    it('should detect path conflicts', async () => {
      const mockTracks: Track[] = [
        {
          id: '1',
          name: 'Track 1.mp3',
          size: 100,
          mtime: 1678886400000,
          source: 'local',
          path: './Track 1.mp3',
          genre: 'Techno',
          mood: 'BANGER',
          status: 'unassigned',
        },
        {
          id: '2',
          name: 'Track 1.mp3',
          size: 200, // Different size to avoid content duplicate
          mtime: 1678886400001, // Different mtime
          source: 'local',
          path: './Track 2.mp3',
          genre: 'Techno',
          mood: 'BANGER',
          status: 'unassigned',
        },
      ];
      (db.tracks.toArray as vi.Mock).mockResolvedValue(mockTracks);

      const plan = await generateMovePlan();

      expect(plan).toHaveLength(2);
      expect(plan[0].conflict).toBeUndefined();
      expect(plan[1].conflict).toBe('path_exists');
      expect(plan[1].conflictReason).toContain('Another track');
    });

    it('should detect duplicate content (size + mtime)', async () => {
      const mockTracks: Track[] = [
        {
          id: '1',
          name: 'Track 1.mp3',
          size: 100,
          mtime: 1678886400000,
          source: 'local',
          path: './Track 1.mp3',
          genre: 'Techno',
          mood: 'BANGER',
          status: 'unassigned',
        },
        {
          id: '2',
          name: 'Track 2.mp3',
          size: 100,
          mtime: 1678886400000,
          source: 'local',
          path: './Track 2.mp3',
          genre: 'House',
          mood: 'ENERGY',
          status: 'unassigned',
        },
      ];
      (db.tracks.toArray as vi.Mock).mockResolvedValue(mockTracks);

      const plan = await generateMovePlan();

      expect(plan).toHaveLength(2);
      expect(plan[0].conflict).toBeUndefined();
      expect(plan[1].conflict).toBe('duplicate_content');
      expect(plan[1].conflictReason).toContain('identical content');
    });
  });

  describe('executeMovePlan', () => {
    it('should move local files and update track status', async () => {
      const mockTrack: Track = {
        id: '1',
        name: 'Track 1.mp3',
        size: 100,
        mtime: 1678886400000,
        source: 'local',
        path: './Track 1.mp3',
        genre: 'Techno',
        mood: 'BANGER',
        status: 'assigned',
      };
      const mockPlanItem = {
        track: mockTrack,
        sourcePath: mockTrack.path,
        targetPath: 'Finished Tracks/Techno/BANGER/Track 1.mp3',
      };

      const mockRemoveEntry = vi.fn();
      const mockGetDirectoryHandle = vi.fn((name) => {
        return Promise.resolve({
          removeEntry: mockRemoveEntry,
          name: name,
        });
      });

      const mockRootHandle = {
        getFileHandle: vi.fn().mockResolvedValue({}),
        getDirectoryHandle: mockGetDirectoryHandle,
        removeEntry: mockRemoveEntry, // For root directory deletion if needed
      };
      (fileSystem.getDirectoryHandle as vi.Mock).mockResolvedValue(mockRootHandle);

      await executeMovePlan([mockPlanItem]);

      expect(fileSystem.getFileHandleFromPath).toHaveBeenCalledWith(mockRootHandle, mockTrack.path);
      expect(fileSystem.moveFile).toHaveBeenCalledWith(mockRootHandle, expect.any(Object), mockPlanItem.targetPath);
      expect(db.tracks.update).toHaveBeenCalledWith(mockTrack.id, { status: 'moved', targetPath: mockPlanItem.targetPath });
      expect(mockRootHandle.getDirectoryHandle).toHaveBeenCalled(); // For parent directory
      const sourceFileName = mockTrack.name;
      expect(mockRemoveEntry).toHaveBeenCalledWith(sourceFileName);
    });

    it('should move dropbox files and update track status', async () => {
      const mockTrack: Track = {
        id: '2',
        name: 'Track 2.mp3',
        size: 200,
        mtime: 1678886400000,
        source: 'dropbox',
        dropboxPathLower: '/Track 2.mp3',
        genre: 'House',
        mood: 'ENERGY',
        status: 'assigned',
      };
      const mockPlanItem = {
        track: mockTrack,
        sourcePath: mockTrack.dropboxPathLower || '',
        targetPath: 'Finished Tracks/House/ENERGY/Track 2.mp3',
      };

      const mockDropboxClient = {};
      (dropbox.getDropboxClient as vi.Mock).mockResolvedValue(mockDropboxClient);

      await executeMovePlan([mockPlanItem]);

      expect(dropbox.moveFile).toHaveBeenCalledWith(mockDropboxClient, mockPlanItem.sourcePath, mockPlanItem.targetPath);
      expect(db.tracks.update).toHaveBeenCalledWith(mockTrack.id, { status: 'moved', targetPath: mockPlanItem.targetPath });
    });

    it('should update track status to error on move failure', async () => {
      const mockTrack: Track = {
        id: '3',
        name: 'Track 3.mp3',
        size: 300,
        mtime: 1678886400000,
        source: 'local',
        path: './Track 3.mp3',
        genre: 'Techno',
        mood: 'BANGER',
        status: 'assigned',
      };
      const mockPlanItem = {
        track: mockTrack,
        sourcePath: mockTrack.path,
        targetPath: 'Finished Tracks/Techno/BANGER/Track 3.mp3',
      };

      (fileSystem.getDirectoryHandle as vi.Mock).mockResolvedValue({});
      (fileSystem.getFileHandleFromPath as vi.Mock).mockRejectedValue(new Error('File not found'));

      await executeMovePlan([mockPlanItem]);

      expect(db.tracks.update).toHaveBeenCalledWith(mockTrack.id, { status: 'error', targetPath: mockPlanItem.targetPath });
    });
  });
});

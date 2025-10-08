import { describe, it, expect, vi } from 'vitest';
import { walkDirectory, AUDIO_EXTENSIONS } from '../../src/core/fs/fileSystem';

describe('fileSystem', () => {
  describe('walkDirectory - Audio Filtering', () => {
    it('should only yield audio files based on AUDIO_EXTENSIONS', async () => {
      const mockFileHandle = (name: string, kind: 'file' | 'directory') => ({
        name,
        kind,
        getFile: vi.fn().mockResolvedValue({ name, size: 100, lastModified: Date.now() }),
      });

      const mockDirectoryHandle = {
        name: 'test-dir',
        kind: 'directory',
        values: vi.fn(async function* () {
          yield mockFileHandle('audio.mp3', 'file');
          yield mockFileHandle('document.pdf', 'file');
          yield mockFileHandle('another_audio.wav', 'file');
          yield mockFileHandle('image.jpg', 'file');
          yield { name: 'sub_dir', kind: 'directory' }; // Yield a simple object for directory
        }),
        getDirectoryHandle: vi.fn().mockImplementation((name) => {
          if (name === 'sub_dir') {
            return Promise.resolve({
              name: 'sub_dir',
              kind: 'directory',
              values: vi.fn(async function* () {
                yield mockFileHandle('nested_audio.aiff', 'file');
                yield mockFileHandle('text.txt', 'file');
              }),
              getDirectoryHandle: vi.fn(), // Mock this for recursive calls
            });
          }
          return Promise.reject(new Error('Directory not found'));
        }),
      };

      const audioFiles: [any, string][] = [];
      for await (const file of walkDirectory(mockDirectoryHandle as any)) {
        audioFiles.push(file);
      }

      expect(audioFiles).toHaveLength(3); // mp3, wav, aiff
      expect(audioFiles[0][0].name).toBe('audio.mp3');
      expect(audioFiles[1][0].name).toBe('another_audio.wav');
      expect(audioFiles[2][0].name).toBe('nested_audio.aiff');
    });

    it('should skip system files and folders', async () => {
      const mockFileHandle = (name: string, kind: 'file' | 'directory') => ({
        name,
        kind,
        getFile: vi.fn().mockResolvedValue({ name, size: 100, lastModified: Date.now() }),
      });

      const mockDirectoryHandle = {
        name: 'root',
        kind: 'directory',
        values: vi.fn(async function* () {
          yield mockFileHandle('audio.mp3', 'file');
          yield mockFileHandle('desktop.ini', 'file');
          yield mockFileHandle('Thumbs.db', 'file');
          yield mockFileHandle('.~temp.mp3', 'file');
          yield mockFileHandle('._resource.aiff', 'file');
          yield { name: '$RECYCLE.BIN', kind: 'directory' };
          yield { name: 'System Volume Information', kind: 'directory' };
          yield mockFileHandle('valid_audio.wav', 'file');
        }),
        getDirectoryHandle: vi.fn().mockImplementation((name) => {
          if (name === '$RECYCLE.BIN' || name === 'System Volume Information') {
            // Simulate access denied for system folders
            throw new Error('Access denied');
          }
          return Promise.resolve({ name, kind: 'directory', values: vi.fn(async function* () {}), getDirectoryHandle: vi.fn() });
        }),
      };

      const audioFiles: [any, string][] = [];
      for await (const file of walkDirectory(mockDirectoryHandle as any)) {
        audioFiles.push(file);
      }

      expect(audioFiles).toHaveLength(2); // audio.mp3, valid_audio.wav
      expect(audioFiles[0][0].name).toBe('audio.mp3');
      expect(audioFiles[1][0].name).toBe('valid_audio.wav');
    });
  });
});

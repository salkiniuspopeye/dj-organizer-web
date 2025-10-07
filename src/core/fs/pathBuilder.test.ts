import { buildTargetPath } from './pathBuilder';
import type { Track } from '../db/db';

describe('buildTargetPath', () => {
  it('should build the correct path', () => {
    const track: Track = {
      id: '1',
      name: 'My Track.mp3',
      size: 12345,
      source: 'local',
      path: '/path/to/My Track.mp3',
      status: 'assigned',
      genre: 'House',
      mood: 'ENERGY',
    };
    const rootDir = 'Finished Tracks';

    const targetPath = buildTargetPath(track, rootDir);

    expect(targetPath).toBe('Finished Tracks/House/ENERGY/My Track.mp3');
  });

  it('should throw an error if genre is missing', () => {
    const track: Track = {
      id: '1',
      name: 'My Track.mp3',
      size: 12345,
      source: 'local',
      path: '/path/to/My Track.mp3',
      status: 'assigned',
      mood: 'ENERGY',
    };
    const rootDir = 'Finished Tracks';

    expect(() => buildTargetPath(track, rootDir)).toThrow(
      'Track must have a genre and a mood to build a target path.'
    );
  });

  it('should throw an error if mood is missing', () => {
    const track: Track = {
      id: '1',
      name: 'My Track.mp3',
      size: 12345,
      source: 'local',
      path: '/path/to/My Track.mp3',
      status: 'assigned',
      genre: 'House',
    };
    const rootDir = 'Finished Tracks';

    expect(() => buildTargetPath(track, rootDir)).toThrow(
      'Track must have a genre and a mood to build a target path.'
    );
  });
});

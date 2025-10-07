import type { Track } from '../db/db';

export function buildTargetPath(track: Track, rootDir: string): string {
  if (!track.genre || !track.mood) {
    throw new Error(
      'Track must have a genre and a mood to build a target path.'
    );
  }
  return `${rootDir}/${track.genre}/${track.mood}/${track.name}`;
}

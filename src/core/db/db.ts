import Dexie, { Table } from 'dexie';

export interface Track {
  id: string;
  name: string;
  size: number;
  duration?: number;
  bitrate?: number;
  samplerate?: number;
  artist?: string;
  title?: string;
  bpm?: number;
  key?: string;
  artwork?: Blob;
  source: 'local' | 'dropbox';
  path: string; // local relative path
  dropboxPathLower?: string;
  genre?: string;
  mood?: 'BANGER' | 'ENERGY' | 'GROOVE' | 'WARMUP' | 'AFTERHOUR';
  status: 'unassigned' | 'assigned' | 'moved' | 'error';
  targetPath?: string;
}

export interface LibrarySource {
  id?: number;
  type: 'local' | 'dropbox';
  name: string;
  // For local, this will be a DirectoryFileHandle, but we can't store that directly.
  // We'll need a wrapper to manage permissions.
  handle?: FileSystemDirectoryHandle;
  // For dropbox, this will be the access token.
  accessToken?: string;
}

export interface Genre {
  id?: number;
  name: string;
}

export const moods = {
  BANGER: { color: 'red', icon: '🔥' },
  ENERGY: { color: 'orange', icon: '⚡️' },
  GROOVE: { color: 'yellow', icon: '🕺' },
  WARMUP: { color: 'green', icon: '☀️' },
  AFTERHOUR: { color: 'blue', icon: '🌙' },
} as const;

export type Mood = keyof typeof moods;

export class MySubClassedDexie extends Dexie {
  tracks!: Table<Track>;
  librarySources!: Table<LibrarySource>;
  genres!: Table<Genre>;

  constructor() {
    super('djOrganizer');
    this.version(1).stores({
      tracks: 'id, name, genre, mood, status, source',
      librarySources: '++id, type, name',
      genres: '++id, &name',
    });
  }
}

export const db = new MySubClassedDexie();

db.on('populate', async () => {
  const defaultGenres = [
    { name: 'Techno' },
    { name: 'House' },
    { name: 'Drum & Bass' },
    { name: 'Trance' },
    { name: 'Ambient' },
  ];
  await db.genres.bulkAdd(defaultGenres);
});

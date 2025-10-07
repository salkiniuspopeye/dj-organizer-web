import { db, type Track } from '../db/db';

/**
 * Generates an M3U8 playlist string for tracks filtered by genre and/or mood.
 * @param tracks The list of tracks to include in the playlist.
 * @param title The title of the playlist (e.g., Genre - Mood).
 * @returns The M3U8 playlist string.
 */
function generateM3U8(tracks: Track[], title: string): string {
  let m3u8Content = `#EXTM3U\n#EXTENC:UTF-8\n#PLAYLIST:${title}\n`;
  tracks.forEach((track) => {
    if (track.targetPath) {
      // Assuming targetPath is relative to the root of the organized library
      m3u8Content += `#EXTINF:${track.duration || -1},${track.artist || ''} - ${track.title || track.name}\n`;
      m3u8Content += `${track.targetPath}\n`;
    }
  });
  return m3u8Content;
}

/**
 * Exports M3U8 playlists based on genre and mood.
 * @param rootFolderName The name of the root folder for the organized library (e.g., "Finished Tracks").
 */
export async function exportM3U8Playlists() {
  const genres = await db.genres.toArray();
  const moods = ['BANGER', 'ENERGY', 'GROOVE', 'WARMUP', 'AFTERHOUR']; // Assuming these are fixed

  const allTracks = await db.tracks.where('status').equals('moved').toArray();

  const playlists: { filename: string; content: string }[] = [];
  let combinedTracks: Track[] = [];

  for (const genre of genres) {
    for (const mood of moods) {
      const filteredTracks = allTracks.filter(
        (track) => track.genre === genre.name && track.mood === mood
      );
      if (filteredTracks.length > 0) {
        const playlistTitle = `${genre.name} - ${mood}`;
        const filename = `${genre.name.replace(/ /g, '_')}_${mood}.m3u8`;
        playlists.push({
          filename,
          content: generateM3U8(filteredTracks, playlistTitle),
        });
        combinedTracks = combinedTracks.concat(filteredTracks);
      }
    }
  }

  // Add a combined playlist
  if (combinedTracks.length > 0) {
    const combinedPlaylistTitle = 'All Moved Tracks';
    const combinedFilename = 'All_Moved_Tracks.m3u8';
    playlists.push({
      filename: combinedFilename,
      content: generateM3U8(combinedTracks, combinedPlaylistTitle),
    });
  }

  // Trigger downloads for each playlist
  playlists.forEach((playlist) => {
    const blob = new Blob([playlist.content], {
      type: 'application/x-mpegURL',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = playlist.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

/**
 * Exports the move log as a CSV or JSON file.
 * @param format The desired format: 'csv' or 'json'.
 */
export async function exportMoveLog(format: 'csv' | 'json') {
  const movedTracks = await db.tracks.where('status').equals('moved').toArray();

  let content: string;
  let filename: string;
  let mimeType: string;

  if (format === 'csv') {
    const headers = [
      'id',
      'name',
      'source',
      'path',
      'dropboxPathLower',
      'genre',
      'mood',
      'status',
      'targetPath',
    ].join(',');
    const rows = movedTracks.map((track) =>
      [
        track.id,
        `"${track.name.replace(/"/g, '""')}"`,
        track.source,
        `"${track.path?.replace(/"/g, '""') || ''}"`,
        `"${track.dropboxPathLower?.replace(/"/g, '""') || ''}"`,
        track.genre || '',
        track.mood || '',
        track.status,
        `"${track.targetPath?.replace(/"/g, '""') || ''}"`,
      ].join(',')
    );
    content = [headers, ...rows].join('\n');
    filename = 'move_log.csv';
    mimeType = 'text/csv';
  } else if (format === 'json') {
    content = JSON.stringify(movedTracks, null, 2);
    filename = 'move_log.json';
    mimeType = 'application/json';
  } else {
    throw new Error('Invalid export format.');
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

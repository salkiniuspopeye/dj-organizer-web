import { db } from './db';
import type { Track } from './db';

export const trackRepository = {
  async addTrack(track: Track) {
    return await db.tracks.add(track);
  },

  async getTrackById(id: string) {
    return await db.tracks.get(id);
  },

  async updateTrack(id: string, changes: Partial<Track>) {
    return await db.tracks.update(id, changes);
  },

  async deleteTrack(id: string) {
    return await db.tracks.delete(id);
  },

  async getAllTracks() {
    return await db.tracks.toArray();
  },

  async getTracksByStatus(status: Track['status']) {
    return await db.tracks.where('status').equals(status).toArray();
  },
};

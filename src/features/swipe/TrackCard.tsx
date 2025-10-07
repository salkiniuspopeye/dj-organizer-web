import React from 'react';
import { Track } from '../../core/db/db';
import { useAudioPreview } from '../../core/audio/useAudioPreview';

interface TrackCardProps {
  track: Track;
}

export function TrackCard({ track }: TrackCardProps) {
  const { isPlaying, play, pause } = useAudioPreview({ src: track.path });

  return (
    <div className="bg-slate-700 p-4 rounded-lg shadow-md text-white">
      <h2 className="text-xl font-bold mb-2">{track.name}</h2>
      <div className="flex items-center gap-4">
        <button
          onClick={isPlaying ? pause : play}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <p>Status: {track.status}</p>
      </div>
    </div>
  );
}

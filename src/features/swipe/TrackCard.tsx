import React, { useState, useEffect } from 'react';
import { type Track, moods, type Genre } from '../../core/db/db';
import { useAudioPreview } from '../../core/audio/useAudioPreview';
import { useTranslation } from 'react-i18next';
import { wrap } from 'comlink';
import type { ThumbnailProcessor } from '../../core/audio/thumbnailWorker';

const ThumbnailProcessorWorker = wrap<ThumbnailProcessor>(new Worker(new URL('../../core/audio/thumbnailWorker.ts', import.meta.url), { type: 'module' }));

interface TrackCardProps {
  track: Track;
  onGenreChange: (trackId: string, genre: string) => void;
  onMoodChange: (trackId: string, mood: keyof typeof moods) => void;
  allGenres: Genre[];
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  onGenreChange,
  onMoodChange,
  allGenres,
}) => {
  const { t } = useTranslation();
  const { isPlaying, togglePlayPause, isLoading, error } = useAudioPreview({
    src: track.path, // Assuming track.path is a URL or File
    startOffsetPercent: 0.35,
  });

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (track.artwork) {
      const generate = async () => {
        const worker = await ThumbnailProcessorWorker();
        const url = await worker.generateThumbnail(track.artwork);
        setThumbnailUrl(url);
      };
      generate();
    } else {
      setThumbnailUrl(null);
    }
  }, [track.artwork]);

  return (
    <div className="relative w-full max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Artwork */}
      <div className="w-full h-80 bg-gray-700 flex items-center justify-center text-gray-400 text-4xl font-bold">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="Artwork" className="object-cover w-full h-full" />
        ) : track.artwork ? (
          <img src={URL.createObjectURL(track.artwork)} alt="Artwork" className="object-cover w-full h-full" />
        ) : (
          <span>{t("no_artwork")}</span>
        )}
      </div>

      {/* Metadata */}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-white truncate">
          {track.title || track.name}
        </h3>
        <p className="text-gray-400 text-sm">
          {track.artist || t('unknown_artist')}
        </p>
        <p className="text-gray-500 text-xs">
          {t('duration')}:{' '}
          {track.duration
            ? `${Math.floor(track.duration / 60)}:${Math.floor(
                track.duration % 60
              )
                .toString()
                .padStart(2, '0')}`
            : 'N/A'}
        </p>
      </div>

      {/* Play/Pause Button */}
      <div className="p-4 border-t border-gray-700 flex justify-center">
        <button
          onClick={togglePlayPause}
          disabled={isLoading || !!error}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isLoading ? t("loading") : isPlaying ? t("pause") : t("play_preview")}
        >
          {isLoading ? t("loading") : isPlaying ? t("pause") : t("play_preview")}
        </button>
        {error && <p className="text-red-500 text-sm mt-2" role="alert">{t("error")}: {error}</p>}
      </div>

      {/* Genre Select */}
      <div className="p-4 border-t border-gray-700">
        <label htmlFor={`genre-select-${track.id}`} className="block text-gray-300 text-sm font-bold mb-2">
          {t("genre")}:
        </label>
        <select
          id={`genre-select-${track.id}`}
          value={track.genre || ''}
          onChange={(e) => onGenreChange(track.id, e.target.value)}
          className="block w-full bg-gray-700 border border-gray-600 text-white py-2 px-3 rounded leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500"
          aria-label={t("select_genre")}
        >
          <option value="">{t("select_genre")}</option>
          {allGenres.map((genre) => (
            <option key={genre.id} value={genre.name}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>

      {/* Mood Select */}
      <div className="p-4 border-t border-gray-700" role="group" aria-labelledby="mood-label">
        <p id="mood-label" className="block text-gray-300 text-sm font-bold mb-2">{t("mood")}:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(moods).map(([moodKey, moodValue]) => (
            <button
              key={moodKey}
              onClick={() => onMoodChange(track.id, moodKey as keyof typeof moods)}
              className={`flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${track.mood === moodKey ? `bg-${moodValue.color}-500 text-white` : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}
              `}
              aria-pressed={track.mood === moodKey}
              aria-label={`${t("mood")}: ${moodKey}`}
            >
              {moodValue.icon} {moodKey}
            </button>
          ))}
        </div>
      </div>

      {/* Status Badge */}
      <div className="p-4 border-t border-gray-700">
        <span
          className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium
            ${
              track.status === 'assigned'
                ? 'bg-green-100 text-green-800'
                : track.status === 'moved'
                  ? 'bg-purple-100 text-purple-800'
                  : track.status === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
            }`}
        >
          {t('status')}:{' '}
          {track.status === 'unassigned'
            ? t('status_unassigned')
            : track.status === 'assigned'
              ? t('status_assigned')
              : track.status === 'moved'
                ? t('status_moved')
                : t('status_error')}
        </span>
      </div>
    </div>
  );
};
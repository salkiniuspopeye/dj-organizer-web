import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Track, type Genre, moods } from '../../core/db/db';
import { TrackCard } from './TrackCard';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 10;

export const SwipeFeed: React.FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const { t } = useTranslation();

  // Fetch all genres from the database
  useEffect(() => {
    const fetchGenres = async () => {
      const genres = await db.genres.toArray();
      setAllGenres(genres);
    };
    fetchGenres();
  }, []);

  // Fetch tracks from the database with pagination
  const tracks = useLiveQuery(
    () => db.tracks.offset(offset).limit(PAGE_SIZE).toArray(),
    [offset]
  );

  const rowVirtualizer = useVirtualizer({
    count: tracks?.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 600, // Estimate height of a TrackCard
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // Load more items when scrolling near the end
  useEffect(() => {
    const loadMore = async () => {
      const [lastItem] = [...virtualItems].reverse();
      if (!lastItem) {
        return;
      }

      if (
        lastItem.index >= (tracks?.length || 0) - 1 &&
        (tracks?.length || 0) < ((await db.tracks.count()) || 0) // Check if there are more tracks in DB
      ) {
        setOffset((prevOffset) => prevOffset + PAGE_SIZE);
      }
    };
    loadMore();
  }, [virtualItems, tracks]); // Corrected dependency: lastItem is not a stable reference

  const handleGenreChange = useCallback(
    async (trackId: string, genre: string) => {
      await db.tracks.update(trackId, { genre, status: 'assigned' });
    },
    []
  );

  const handleMoodChange = useCallback(
    async (trackId: string, mood: keyof typeof moods) => {
      await db.tracks.update(trackId, { mood, status: 'assigned' });
    },
    []
  );

  if (!tracks) {
    return <div className="text-white">{t('loading_tracks')}</div>;
  }

  if (tracks.length === 0) {
    return <div className="text-white">{t('no_tracks_found')}</div>;
  }

  return (
    <div
      ref={parentRef}
      className="list-container w-full h-[calc(100vh-100px)] overflow-auto snap-y snap-mandatory"
    >
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const track = tracks[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              className="snap-center"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <TrackCard
                track={track}
                onGenreChange={handleGenreChange}
                onMoodChange={handleMoodChange}
                allGenres={allGenres}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

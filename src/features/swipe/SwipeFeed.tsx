import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Track } from '../../core/db/db';
import { TrackCard } from './TrackCard';

const mockTracks: Track[] = [
  {
    id: '1',
    name: 'Track 1',
    path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    size: 1000,
    source: 'local',
    status: 'unassigned',
  },
  {
    id: '2',
    name: 'Track 2',
    path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    size: 1000,
    source: 'local',
    status: 'unassigned',
  },
  {
    id: '3',
    name: 'Track 3',
    path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    size: 1000,
    source: 'local',
    status: 'unassigned',
  },
];

export function SwipeFeed() {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: mockTracks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 350, // estimate of a card's height
  });

  return (
    <div ref={parentRef} className="h-screen overflow-y-auto snap-y snap-mandatory">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            className="snap-start"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
              padding: '1rem',
            }}
          >
            <TrackCard track={mockTracks[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}

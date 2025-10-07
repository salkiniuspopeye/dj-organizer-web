import React, { useState, useCallback } from "react";
import { SwipeFeed } from "./features/swipe/SwipeFeed";
import { useTranslation } from 'react-i18next';
import { generateMovePlan, executeMovePlan, type MovePlanItem } from './core/fs/moveEngine';
import { MoveProgressDialog } from './shared/ui/MoveProgressDialog';
import { db } from './core/db/db';

export default function App() {
  const { t } = useTranslation();
  const [isMoving, setIsMoving] = useState(false);
  const [moveProgress, setMoveProgress] = useState(0);
  const [moveTotal, setMoveTotal] = useState(0);
  const [currentMoveItem, setCurrentMoveItem] = useState<MovePlanItem | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleGenerateAndExecuteMovePlan = useCallback(async () => {
    setIsMoving(true);
    setMoveProgress(0);
    setMoveTotal(0);
    setCurrentMoveItem(null);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Add some dummy tracks for testing if the DB is empty
      const trackCount = await db.tracks.count();
      if (trackCount === 0) {
        await db.tracks.bulkAdd([
          {
            id: 'test-track-1',
            name: 'Test Track 1.mp3',
            size: 1024 * 1024 * 5, // 5MB
            mtime: Date.now(),
            source: 'local',
            path: 'C:/Users/tins/Music/Test Track 1.mp3',
            genre: 'Techno',
            mood: 'BANGER',
            status: 'assigned',
          },
          {
            id: 'test-track-2',
            name: 'Test Track 2.mp3',
            size: 1024 * 1024 * 7, // 7MB
            mtime: Date.now() + 1000,
            source: 'local',
            path: 'C:/Users/tins/Music/Test Track 2.mp3',
            genre: 'House',
            mood: 'ENERGY',
            status: 'assigned',
          },
        ]);
      }

      const plan = await generateMovePlan();
      setMoveTotal(plan.length);

      await executeMovePlan(plan, (progress, total, item) => {
        setMoveProgress(progress);
        setMoveTotal(total);
        setCurrentMoveItem(item);
      }, controller.signal);

      alert('Move operation completed!');
    } catch (error: any) {
      if (error.name === 'AbortError') {
        alert('Move operation cancelled.');
      } else {
        alert(`Move operation failed: ${error.message}`);
      }
    } finally {
      setIsMoving(false);
      setAbortController(null);
    }
  }, []);

  const handleCancelMove = useCallback(() => {
    abortController?.abort();
  }, [abortController]);

  return (
    <div className="p-4 rounded-xl bg-indigo-600 text-white">
      {t("app_title")}
      <button
        onClick={handleGenerateAndExecuteMovePlan}
        disabled={isMoving}
        className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        {isMoving ? 'Moving...' : 'Generate & Execute Move Plan'}
      </button>
      <MoveProgressDialog
        isOpen={isMoving}
        progress={moveProgress}
        total={moveTotal}
        currentItem={currentMoveItem}
        onCancel={handleCancelMove}
      />
      <SwipeFeed />
    </div>
  );
}

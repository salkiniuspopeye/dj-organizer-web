import React, { useState, useCallback, useEffect } from "react";
import { SwipeFeed } from "./features/swipe/SwipeFeed";
import { useTranslation } from 'react-i18next';
import { generateMovePlan, executeMovePlan, type MovePlanItem } from './core/fs/moveEngine';
import { MoveProgressDialog } from './shared/ui/MoveProgressDialog';
import { db, type MovePlan } from './core/db/db';

export default function App() {
  const { t } = useTranslation();
  const [isMoving, setIsMoving] = useState(false);
  const [moveProgress, setMoveProgress] = useState(0);
  const [moveTotal, setMoveTotal] = useState(0);
  const [currentMoveItem, setCurrentMoveItem] = useState<MovePlanItem | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [pendingMovePlan, setPendingMovePlan] = useState<MovePlan | null>(null);

  // Check for pending move plans on startup
  useEffect(() => {
    const checkPendingMovePlans = async () => {
      const pendingPlans = await db.movePlans.where('status').equals('pending').toArray();
      if (pendingPlans.length > 0) {
        setPendingMovePlan(pendingPlans[0]); // Assume only one pending plan for simplicity
      }
    };
    checkPendingMovePlans();
  }, []);

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

      const planItems = await generateMovePlan();
      const movePlan = await db.movePlans.where('status').equals('pending').last(); // Get the newly created pending plan
      if (!movePlan) throw new Error('No pending move plan found after generation.');

      setMoveTotal(planItems.length);

      await executeMovePlan(movePlan.id, planItems, (progress, total, item) => {
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

  const handleResumeMove = useCallback(async () => {
    if (!pendingMovePlan) return;

    setIsMoving(true);
    setMoveProgress(0);
    setMoveTotal(pendingMovePlan.planItems.length);
    setCurrentMoveItem(null);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Find the last completed item to resume from
      let startIndex = 0;
      for (let i = 0; i < pendingMovePlan.planItems.length; i++) {
        const item = pendingMovePlan.planItems[i];
        const track = await db.tracks.get(item.track.id);
        if (track?.status === 'moved') {
          startIndex = i + 1;
        } else {
          break;
        }
      }

      const remainingPlanItems = pendingMovePlan.planItems.slice(startIndex);

      await executeMovePlan(pendingMovePlan.id, remainingPlanItems, (progress, total, item) => {
        setMoveProgress(startIndex + progress);
        setMoveTotal(pendingMovePlan.planItems.length);
        setCurrentMoveItem(item);
      }, controller.signal);

      alert('Move operation resumed and completed!');
    } catch (error: any) {
      if (error.name === 'AbortError') {
        alert('Move operation cancelled.');
      } else {
        alert(`Move operation failed: ${error.message}`);
      }
    } finally {
      setIsMoving(false);
      setAbortController(null);
      setPendingMovePlan(null);
    }
  }, [pendingMovePlan]);

  const handleDiscardMove = useCallback(async () => {
    if (!pendingMovePlan) return;
    await db.movePlans.delete(pendingMovePlan.id);
    setPendingMovePlan(null);
    alert('Pending move plan discarded.');
  }, [pendingMovePlan]);

  return (
    <div className="p-4 rounded-xl bg-indigo-600 text-white">
      {t("app_title")}
      <button
        onClick={() => alert('Ordner wählen clicked!')} // Placeholder for folder picker logic
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        aria-label="Ordner wählen"
      >
        Ordner wählen
      </button>

      <button
        onClick={handleGenerateAndExecuteMovePlan}
        disabled={isMoving || !!pendingMovePlan}
        className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        aria-label={isMoving ? 'Moving files' : 'Generate and execute move plan'}
      >
        {isMoving ? 'Moving...' : 'Generate & Execute Move Plan'}
      </button>

      {pendingMovePlan && (
        <div className="mt-4 p-4 bg-yellow-600 rounded-lg">
          <p className="text-white mb-2">A pending move operation was found.</p>
          <button
            onClick={handleResumeMove}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
            aria-label="Resume pending move operation"
          >
            Resume Move
          </button>
          <button
            onClick={handleDiscardMove}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            aria-label="Discard pending move operation"
          >
            Discard Move
          </button>
        </div>
      )}

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

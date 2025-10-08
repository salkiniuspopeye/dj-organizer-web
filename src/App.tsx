import React, { useState, useCallback, useEffect } from "react";
import { SwipeFeed } from "./features/swipe/SwipeFeed";
import { useTranslation } from 'react-i18next';
import { generateMovePlan, executeMovePlan, type MovePlanItem } from './core/fs/moveEngine';
import { MoveProgressDialog } from './shared/ui/MoveProgressDialog';
import { db, type MovePlan, type Track } from './core/db/db';
import { saveDirectoryHandle, loadDirectoryHandle } from './core/fs/directoryHandler';
import { walkDirectory } from './core/fs/fileSystem';
import { trackRepository } from './core/db/trackRepository';

export default function App() {
  const { t } = useTranslation();
  const [isMoving, setIsMoving] = useState(false);
  const [moveProgress, setMoveProgress] = useState(0);
  const [moveTotal, setMoveTotal] = useState(0);
  const [currentMoveItem, setCurrentMoveItem] = useState<MovePlanItem | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [pendingMovePlan, setPendingMovePlan] = useState<MovePlan | null>(null);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [trackCount, setTrackCount] = useState(0);

  const handleIndexFolder = useCallback(async () => {
    if (!directoryHandle) return;

    console.log('Indexing folder:', directoryHandle.name);
    const newTracks: Track[] = [];
    for await (const [fileHandle, relativePath] of walkDirectory(directoryHandle)) {
      const file = await fileHandle.getFile();
      newTracks.push({
        id: file.name, // Use file name as ID for now, should be more robust later
        name: file.name,
        lowerCaseName: file.name.toLowerCase(),
        size: file.size,
        mtime: file.lastModified,
        source: 'local',
        path: relativePath,
        status: 'unassigned',
      });
    }
    await trackRepository.saveTracks(newTracks);
    console.log(`Indexed ${newTracks.length} tracks.`);
  }, [directoryHandle]);

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

  // Load directory handle on startup
  useEffect(() => {
    const loadHandle = async () => {
      const handle = await loadDirectoryHandle();
      setDirectoryHandle(handle);
    };
    loadHandle();
  }, []);

  useEffect(() => {
    handleIndexFolder();
  }, [directoryHandle, handleIndexFolder]);

  // Fetch track count on startup and after indexing
  useEffect(() => {
    const fetchTrackCount = async () => {
      const count = await db.tracks.count();
      setTrackCount(count);
    };
    fetchTrackCount();
  }, [directoryHandle]); // Re-fetch when directoryHandle changes (implies new indexing)

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
            lowerCaseName: 'test track 1.mp3',
            size: 1024 * 1024 * 5, // 5MB
            mtime: Date.now(),
            source: 'local',
            path: 'C:/Users/tins/Music/Test Track 1.mp3',
            genre: 'Techno',
            mood: 'BANGER',
            status: 'assigned',
          } as Track, // Explicitly cast to Track
          {
            id: 'test-track-2',
            name: 'Test Track 2.mp3',
            lowerCaseName: 'test track 2.mp3',
            size: 1024 * 1024 * 7, // 7MB
            mtime: Date.now() + 1000,
            source: 'local',
            path: 'C:/Users/tins/Music/Test Track 2.mp3',
            genre: 'House',
            mood: 'ENERGY',
            status: 'assigned',
          } as Track, // Explicitly cast to Track
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
        setMoveTotal(total); // Use the 'total' parameter from the callback
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
      {trackCount === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-lg text-gray-300 mb-4">{t("empty_state_message")}</p>
          <button
            onClick={async () => {
              try {
                const handle = await window.showDirectoryPicker();
                await saveDirectoryHandle(handle);
                setDirectoryHandle(handle);
              } catch (error) {
                console.error('Error selecting directory:', error);
              }
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Ordner wählen"
          >
            {t("select_folder_button")}
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={async () => {
              try {
                const handle = await window.showDirectoryPicker();
                await saveDirectoryHandle(handle);
                setDirectoryHandle(handle);
              } catch (error) {
                console.error('Error selecting directory:', error);
              }
            }}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            aria-label="Ordner wählen"
          >
            Ordner wählen
          </button>

          <button
            onClick={handleGenerateAndExecuteMovePlan}
            disabled={isMoving || !!pendingMovePlan}
            className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            aria-label={isMoving ? 'Moving files' : 'Generate and execute move plan'}
          >
            {isMoving ? 'Moving...' : 'Generate & Execute Move Plan'}
          </button>

          {pendingMovePlan && (
            <div className="mt-4 p-4 bg-yellow-600 rounded-lg">
              <p className="text-white mb-2">A pending move operation was found.</p>
              <button
                onClick={handleResumeMove}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Resume pending move operation"
              >
                Resume Move
              </button>
              <button
                onClick={handleDiscardMove}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
        </>
      )}
    </div>
  );
}

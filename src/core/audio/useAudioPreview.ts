import { useState, useEffect, useRef, useCallback } from 'react';
import { wrap } from 'comlink';
import type { AudioProcessor } from './audioWorker';

// Create a single, shared AudioContext.
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

// Create a Comlink-wrapped worker instance
const AudioProcessorWorker = wrap<AudioProcessor>(new Worker(new URL('./audioWorker.ts', import.meta.url), { type: 'module' }));

const MAX_CONCURRENT_DECODES = 3; // Limit concurrent decodes
let currentDecodes = 0;
const decodeQueue: (() => Promise<void>)[] = [];

async function processDecodeQueue() {
  if (currentDecodes < MAX_CONCURRENT_DECODES && decodeQueue.length > 0) {
    currentDecodes++;
    const nextDecode = decodeQueue.shift();
    if (nextDecode) {
      try {
        await nextDecode();
      } finally {
        currentDecodes--;
        processDecodeQueue();
      }
    }
  }
}

interface UseAudioPreviewProps {
  src?: string | File;
  startOffsetPercent?: number; // e.g., 0.35 for 35%
  loopDuration?: number; // in seconds
}

export function useAudioPreview({
  src,
  startOffsetPercent = 0.35,
  loopDuration = 20,
}: UseAudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(!!src);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef(0);
  const startedAtRef = useRef(0);

  const cleanupSource = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.onended = null;
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!src) {
      cleanupSource();
      audioBufferRef.current = null;
      setIsLoading(false);
      return;
    }

    const decodeAndSetAudio = async () => {
      setIsLoading(true);
      setError(null);
      cleanupSource();

      try {
        const url = src instanceof File ? URL.createObjectURL(src) : src;
        const decodedDuration = await AudioProcessorWorker.getAudioDuration(url);
        
        // Re-fetch and decode on main thread for playback (worker only for duration probe)
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);

        audioBufferRef.current = decodedBuffer;
        setDuration(decodedDuration);
      } catch (e) {
        setError('Failed to load or decode audio.');
        console.error(e);
        audioBufferRef.current = null;
      }
      setIsLoading(false);
    };

    const enqueueDecode = () => {
      decodeQueue.push(decodeAndSetAudio);
      processDecodeQueue();
    };

    enqueueDecode();

    return cleanupSource;
  }, [src, cleanupSource]);

  const play = useCallback(() => {
    if (!audioBufferRef.current || isPlaying) return;

    cleanupSource(); // Clean up any previous source

    const context = audioContext;
    const source = context.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(context.destination);
    sourceRef.current = source;

    let startOffset = duration * startOffsetPercent;
    // Fallback for short files
    if (duration < 60) {
      // Example threshold for a "short file"
      startOffset = Math.min(10, duration * 0.1);
    }

    source.loop = true;
    source.loopStart = startOffset;
    source.loopEnd = startOffset + loopDuration;

    startTimeRef.current = 0; // We always start fresh
    startedAtRef.current = context.currentTime;

    source.start(0, startOffset);
    setIsPlaying(true);

    source.onended = () => {
      if (sourceRef.current === source) {
        setIsPlaying(false);
      }
    };
  }, [isPlaying, duration, startOffsetPercent, loopDuration, cleanupSource]);

  const pause = useCallback(() => {
    if (!isPlaying || !sourceRef.current) return;

    const context = audioContext;
    // Calculate how much time has passed
    const elapsedTime = context.currentTime - startedAtRef.current;
    startTimeRef.current += elapsedTime;

    cleanupSource();
    setIsPlaying(false);
  }, [isPlaying, cleanupSource]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  return { isPlaying, isLoading, togglePlayPause, duration, error };
}

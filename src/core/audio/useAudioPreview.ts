import { useState, useEffect, useRef } from 'react';

interface UseAudioPreviewProps {
  src?: string | File;
  startOffset?: number; // as a percentage, e.g., 0.35
}

export function useAudioPreview({ src, startOffset = 0.35 }: UseAudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (!src) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;

    const loadAudio = async () => {
      try {
        const response = await fetch(src instanceof File ? URL.createObjectURL(src) : src);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        setDuration(audioBuffer.duration);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        sourceRef.current = source;
      } catch (e) {
        setError('Failed to load or decode audio.');
        console.error(e);
      }
    };

    loadAudio();

    return () => {
      sourceRef.current?.stop();
      audioContext.close();
    };
  }, [src]);

  const play = () => {
    if (!sourceRef.current || !duration) return;
    const startTime = duration * startOffset;
    sourceRef.current.start(0, startTime);
    setIsPlaying(true);
  };

  const pause = () => {
    if (!sourceRef.current) return;
    sourceRef.current.stop();
    setIsPlaying(false);
  };

  return { isPlaying, play, pause, duration, error };
}

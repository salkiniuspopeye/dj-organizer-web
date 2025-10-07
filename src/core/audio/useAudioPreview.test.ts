import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mocking Web Audio API and fetch before importing useAudioPreview
const mockBufferSource = {
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  disconnect: vi.fn(),
  loop: false,
  loopStart: 0,
  loopEnd: 0,
  onended: null,
  buffer: null,
};

const mockAudioContext = {
  currentTime: 0,
  decodeAudioData: vi.fn(), // Will be mocked per test
  createBufferSource: vi.fn(() => mockBufferSource),
  destination: {},
  close: vi.fn(),
};

vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext));
vi.stubGlobal('webkitAudioContext', vi.fn(() => mockAudioContext));

vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  })
));

// Now import the hook after mocks are set up
import { useAudioPreview } from './useAudioPreview';

describe('useAudioPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mocks that might have state
    mockBufferSource.loop = false;
    mockBufferSource.loopStart = 0;
    mockBufferSource.loopEnd = 0;
    // Reset decodeAudioData mock for each test
    mockAudioContext.decodeAudioData.mockResolvedValue({ duration: 180 });
  });

  it('should start with correct initial state', () => {
    const { result } = renderHook(() => useAudioPreview({ src: 'test.mp3' }));
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isLoading).toBe(true); // Should be true initially
    expect(result.current.duration).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('should load audio and set duration', async () => {
    const { result } = renderHook(() => useAudioPreview({ src: 'test.mp3' }));
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockAudioContext.decodeAudioData).toHaveBeenCalled();
    expect(result.current.duration).toBe(180);
  });

  it('should calculate the correct start offset for a standard track (35%)', async () => {
    const { result } = renderHook(() => useAudioPreview({ src: 'test.mp3', startOffsetPercent: 0.35, loopDuration: 20 }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.togglePlayPause();
    });

    const expectedStartOffset = 180 * 0.35; // 63
    expect(mockBufferSource.start).toHaveBeenCalledWith(0, expectedStartOffset);
    expect(mockBufferSource.loop).toBe(true);
    expect(mockBufferSource.loopStart).toBe(expectedStartOffset);
    expect(mockBufferSource.loopEnd).toBe(expectedStartOffset + 20);
  });

  it('should calculate the correct start offset for a short track', async () => {
    mockAudioContext.decodeAudioData.mockResolvedValueOnce({ duration: 40 }); // 40 seconds
    const { result } = renderHook(() => useAudioPreview({ src: 'short.mp3' }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.togglePlayPause();
    });

    const expectedStartOffset = 40 * 0.1; // 4, because min(10, 4) is 4
    expect(mockBufferSource.start).toHaveBeenCalledWith(0, expectedStartOffset);
  });

  it('should toggle play and pause', async () => {
    const { result } = renderHook(() => useAudioPreview({ src: 'test.mp3' }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Play
    act(() => {
      result.current.togglePlayPause();
    });
    expect(result.current.isPlaying).toBe(true);
    expect(mockBufferSource.start).toHaveBeenCalledTimes(1);

    // Pause
    act(() => {
      result.current.togglePlayPause();
    });
    expect(result.current.isPlaying).toBe(false);
    expect(mockBufferSource.stop).toHaveBeenCalledTimes(1);
  });
});
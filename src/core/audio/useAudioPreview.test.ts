import { renderHook, act } from '@testing-library/react';
import { useAudioPreview } from './useAudioPreview';

// Mocking Web Audio API
const mockBufferSource = {
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  buffer: null,
};
const mockAudioContext = {
  decodeAudioData: vi.fn(() => Promise.resolve({ duration: 100 })),
  createBufferSource: vi.fn(() => mockBufferSource),
  close: vi.fn(),
};
global.AudioContext = vi.fn(() => mockAudioContext) as any;

(global as any).fetch = vi.fn(() =>
  Promise.resolve({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  })
);

describe('useAudioPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate the correct start time', async () => {
    const { result } = renderHook(() => useAudioPreview({ src: 'test.mp3' }));

    // Wait for the audio to be loaded
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.play();
    });

    expect(mockBufferSource.start).toHaveBeenCalledWith(0, 35);
  });
});

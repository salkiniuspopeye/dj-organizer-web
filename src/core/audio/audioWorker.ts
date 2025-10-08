import { expose } from 'comlink';

export interface AudioProcessor {
  getAudioDuration(audioFile: File | string): Promise<number>;
}

const audioProcessor: AudioProcessor = {
  async getAudioDuration(audioFile: File | string): Promise<number> {
    const audioContext = new (self.OfflineAudioContext || (self as any).webkitOfflineAudioContext)(1, 1, 44100); // Sample rate doesn't matter for duration
    try {
      let arrayBuffer: ArrayBuffer;
      if (typeof audioFile === 'string') {
        const response = await fetch(audioFile);
        arrayBuffer = await response.arrayBuffer();
      } else {
        arrayBuffer = await audioFile.arrayBuffer();
      }
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer.duration;
    } catch (error) {
      console.error('Error decoding audio in worker:', error);
      throw error;
    }
  },
};

expose(audioProcessor);

import runpod from 'runpod';
import { ShortCreator } from './short-creator/ShortCreator';
import { Kokoro } from './short-creator/libraries/Kokoro';
import { Remotion } from './short-creator/libraries/Remotion';
import { Whisper } from './short-creator/libraries/Whisper';
import { FFMpeg } from './short-creator/libraries/FFmpeg';
import { PexelsAPI } from './short-creator/libraries/Pexels';
import { MusicManager } from './short-creator/music';
import { Config } from './config';

const handler = async (event: any) => {
  const config = new Config();
  
  // Fix: Kokoro.init only takes 1 argument in your lib
  const kokoro = await Kokoro.init("fp32");
  const remotion = new Remotion(config);
  // Fix: Whisper constructor expects the config object
  const whisper = new Whisper("openai;
  const ffmpeg = new FFMpeg();
  const pexels = new PexelsAPI(config);
  const music = new MusicManager(config);

  const creator = new ShortCreator(config, remotion, kokoro, whisper, ffmpeg, pexels, music);
  
  try {
    // Note: We cast to 'any' to bypass private method restrictions for the RunPod trigger
    const videoId = await (creator as any).createShort("runpod-job-" + event.id, event.input.scenes, event.input.config);
    return { success: true, videoId: videoId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

runpod.serverless.start(handler);

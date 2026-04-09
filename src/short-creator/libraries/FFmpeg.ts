import { Logger } from "pino";
import { config } from "../../config";

export class FFMpeg {
  private logger: Logger;
  constructor() {
    this.logger = (config as any).logger;
    const ffmpegPath = "/usr/bin/ffmpeg";
    this.logger.info({ path: ffmpegPath }, "FFmpeg path set");
  }
}

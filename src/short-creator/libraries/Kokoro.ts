import { KokoroTTS, TextSplitterStream } from "kokoro-js";
import { VoiceEnum, type kokoroModelPrecision, type Voices } from "../../types/shorts";
import { KOKORO_MODEL, logger } from "../../config";

export class Kokoro {
  constructor(private tts: KokoroTTS) {}

  async generate(text: string, voice: Voices): Promise<{ audio: ArrayBuffer; audioLength: number; }> {
    const splitter = new TextSplitterStream();
    const stream = this.tts.stream(splitter, { voice });
    splitter.push(text);
    splitter.close();

    const output: any[] = [];
    for await (const chunk of stream) { output.push(chunk); }

    const audioBuffers: ArrayBuffer[] = [];
    let audioLength = 0;
    for (const chunk of output) {
      audioBuffers.push(chunk.toWav());
      audioLength += chunk.length / chunk.sampling_rate;
    }

    return { audio: Kokoro.concatWavBuffers(audioBuffers), audioLength };
  }

  static concatWavBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
    const header = Buffer.from(buffers[0].slice(0, 44));
    let totalDataLength = 0;
    const dataParts = buffers.map((buf) => {
      const b = Buffer.from(buf);
      const data = b.slice(44);
      totalDataLength += data.length;
      return data;
    });
    header.writeUInt32LE(36 + totalDataLength, 4);
    header.writeUInt32LE(totalDataLength, 40);
    return Buffer.concat([header, ...dataParts]);
  }

  static async init(dtype: kokoroModelPrecision): Promise<Kokoro> {
    const tts = await (KokoroTTS as any).from_pretrained(KOKORO_MODEL, { dtype, device: "cpu" });
    return new Kokoro(tts);
  }

  listAvailableVoices(): Voices[] { return Object.values(VoiceEnum) as Voices[]; }
}

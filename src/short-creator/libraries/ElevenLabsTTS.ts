import axios from "axios";
import { logger } from "../../config";

export interface ElevenLabsTTSOptions {
  text: string;
  voiceId: string; // e.g. lV90UmdRoVFQHzkxUPeu
  modelId?: string; // optional model, default to eleven_multilingual_v2
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export class ElevenLabsTTS {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    const envKey = process.env.ELEVENLABS_API_KEY;
    this.apiKey = apiKey || (envKey as string);
    this.baseUrl = "https://api.elevenlabs.io/v1";

    if (!this.apiKey) {
      throw new Error(
        "ELEVENLABS_API_KEY is not set. Please add it to your environment (.env)."
      );
    }
  }

  async synthesize(options: ElevenLabsTTSOptions): Promise<ArrayBuffer> {
    const {
      text,
      voiceId,
      modelId = "eleven_multilingual_v2",
      stability = 1,
      similarityBoost = 1,
      style = 1.0,
      useSpeakerBoost = true,
    } = options;

    const url = `${this.baseUrl}/text-to-speech/${voiceId}/stream`;

    const payload = {
      text,
      model_id: modelId,
      voice_settings: {
        stability,
        similarity_boost: similarityBoost,
        style,
        use_speaker_boost: useSpeakerBoost,
      },
      optimize_streaming_latency: 4,
    };

    logger.debug({ url, voiceId }, "Calling ElevenLabs TTS");

    const response = await axios.post(url, payload, {
      responseType: "arraybuffer",
      headers: {
        "xi-api-key": this.apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      timeout: 30000,
    });

    if (response.status !== 200) {
      throw new Error(`ElevenLabs TTS failed with status ${response.status}`);
    }

    return response.data as ArrayBuffer;
  }
}



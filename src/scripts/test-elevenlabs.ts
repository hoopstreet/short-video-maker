import fs from "fs-extra";
import path from "path";
import "dotenv/config";
import { ElevenLabsTTS } from "../short-creator/libraries/ElevenLabsTTS";

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY as string;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "lV90UmdRoVFQHzkxUPeu";
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is missing in environment");
  }

  const text = process.env.TEST_TTS_TEXT || "Merhaba! Bu ses ElevenLabs üzerinden oluşturuldu.";

  const tts = new ElevenLabsTTS(apiKey);
  const audio = await tts.synthesize({ text, voiceId });

  const outDir = path.join(process.cwd(), "data");
  await fs.ensureDir(outDir);
  const outPath = path.join(outDir, "elevenlabs_test.mp3");
  await fs.writeFile(outPath, Buffer.from(audio));
  console.log(`Saved: ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});



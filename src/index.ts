import runpod from 'runpod';
import { ShortCreator } from './short-creator/ShortCreator';

// 1. Define the handler for RunPod
const handler = async (event: any) => {
  console.log("Received Job:", event.id);
  const creator = new ShortCreator();
  
  try {
    const result = await creator.generate(event.input);
    return { success: true, url: result.url };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// 2. Start the RunPod Worker
// This "listener" is what the SDK is currently missing
runpod.serverless.start(handler);

console.log("RunPod Node.js Worker initialized and polling...");

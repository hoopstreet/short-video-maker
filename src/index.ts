import * as runpod from "runpod-sdk";
import * as serverModule from "./server/server";

const app = (serverModule as any).default || (serverModule as any).app || serverModule;

async function handler(event: any) {
  console.log("RunPod Job Received:", event.id);
  // The input data from Hugging Face will be in event.input
  return { 
    status: "success", 
    message: "Video worker is active",
    receivedInput: event.input 
  };
}

if (process.env.RUNPOD_API_KEY) {
    console.log("Starting RunPod Worker...");
    try {
        // In the JS SDK, for a worker, we often use the 'run' or 'start' 
        // depending on the internal version. 
        const rp: any = (runpod as any).default || runpod;

        // If 'start' exists (standard for newer workers)
        if (typeof rp.start === 'function') {
            rp.start({ handler });
        } 
        // Fallback for older JS worker templates
        else if (typeof (runpod as any).serverless === 'function') {
            (runpod as any).serverless(handler);
        }
        else {
            console.error("SDK Keys found:", Object.keys(rp));
            throw new Error("Compatible worker start method not found.");
        }
    } catch (err: any) {
        console.error("Worker Initialization Failed:", err.message);
        process.exit(1);
    }
} else {
    const port = process.env.PORT || 3123;
    if (app && typeof app.listen === 'function') {
        app.listen(port, () => console.log(`Local server on port ${port}`));
    } else {
        console.error("Express app not found.");
        process.exit(1);
    }
}

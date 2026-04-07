import * as serverModule from "./server/server";

// 1. Find the express app
const app = (serverModule as any).default || (serverModule as any).app || serverModule;

// 2. The Handler Function
async function handler(event: any) {
  console.log("RunPod Job Received:", event.id);
  // event.input contains the data from Hugging Face
  return { 
    status: "success", 
    message: "Node.js Worker Processed Job", 
    input: event.input 
  };
}

// 3. Start Logic
if (process.env.RUNPOD_API_KEY) {
    console.log("Starting RunPod Node.js Worker...");
    try {
        // We use the direct require for the serverless entry point
        const runpod = require("runpod-sdk");
        
        // This is the specific method for the JS Worker Container
        if (runpod.serverless) {
            runpod.serverless(handler);
        } else {
            // Fallback for different SDK versions
            const start = runpod.start || (runpod.default && runpod.default.start);
            if (typeof start === 'function') {
                start({ handler });
            } else {
                console.error("Manual Start Triggered...");
                // If the SDK fails to provide a listener, we manually listen (Advanced)
                throw new Error("Worker listener not found in SDK");
            }
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
        process.exit(1);
    }
}

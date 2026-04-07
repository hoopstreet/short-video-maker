import * as serverModule from "./server/server";

// 1. Find the express app
const app = (serverModule as any).default || (serverModule as any).app || serverModule;

async function handler(event: any) {
  console.log("RunPod Job Received:", event.id);
  // This is where your video logic will eventually sit
  return { status: "success", message: "Worker reached" };
}

if (process.env.RUNPOD_API_KEY) {
    console.log("Starting in RunPod Serverless mode...");
    
    try {
        // 2. Use dynamic require to bypass bundling issues
        const runpod = require("runpod-sdk");
        const init = runpod.default || runpod;
        const rp = typeof init === 'function' ? init(process.env.RUNPOD_API_KEY) : init;

        if (rp && typeof rp.serverless === 'function') {
            rp.serverless(handler);
        } else {
            throw new Error("rp.serverless is not a function");
        }
    } catch (err: any) {
        console.error("RunPod Initialization Failed:", err.message);
        process.exit(1);
    }
} else {
    const port = process.env.PORT || 3123;
    if (app && typeof app.listen === 'function') {
        app.listen(port, () => {
            console.log(`Server running locally on port ${port}`);
        });
    } else {
        console.error("Express app not found.");
        process.exit(1);
    }
}

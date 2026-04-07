import * as serverModule from "./server/server";

// 1. Find the express app
const app = (serverModule as any).default || (serverModule as any).app || serverModule;

async function handler(event: any) {
  console.log("RunPod Job Received:", event.id);
  return { status: "success", message: "Worker is active" };
}

if (process.env.RUNPOD_API_KEY) {
    console.log("Starting in RunPod Serverless mode...");
    
    try {
        // 2. Direct access to the serverless function
        const runpod = require("runpod-sdk");
        
        // Some versions of the SDK export a function, others an object
        const rp = (typeof runpod === 'function') ? runpod(process.env.RUNPOD_API_KEY) : runpod;
        
        // Look for serverless in multiple locations
        const startServerless = rp.serverless || (runpod as any).serverless;

        if (typeof startServerless === 'function') {
            startServerless(handler);
        } else {
            throw new Error("Could not find the serverless function in the SDK.");
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

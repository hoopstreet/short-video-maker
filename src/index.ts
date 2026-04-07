import runpod from "runpod-sdk";
import * as serverModule from "./server/server";

// 1. Find the express app
const app = (serverModule as any).default || (serverModule as any).app || serverModule;

async function handler(event: any) {
  console.log("RunPod Job Received:", event.id);
  return { status: "success", message: "Worker reached successfully" };
}

if (process.env.RUNPOD_API_KEY) {
    console.log("Starting in RunPod Serverless mode...");
    
    // 2. Robust SDK Initialization
    // Some versions of the SDK require runpod(key), others runpod.default(key)
    const init = (runpod as any).default || runpod;
    const rp = typeof init === 'function' ? init(process.env.RUNPOD_API_KEY) : init;

    // 3. Robust Serverless Call
    if (rp && typeof rp.serverless === 'function') {
        rp.serverless(handler);
    } else if (typeof (runpod as any).serverless === 'function') {
        (runpod as any).serverless(handler);
    } else {
        console.error("Could not find serverless function in runpod-sdk");
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

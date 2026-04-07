import * as serverModule from "./server/server";

const app = (serverModule as any).default || (serverModule as any).app || serverModule;

async function handler(event: any) {
  console.log("RunPod Job Received:", event.id);
  return { status: "success", message: "Worker is active and listening" };
}

if (process.env.RUNPOD_API_KEY) {
    console.log("Starting in RunPod Serverless mode...");
    try {
        const runpod = require("runpod-sdk");
        
        // Try Method A: Standard init
        let rp = typeof runpod === 'function' ? runpod(process.env.RUNPOD_API_KEY) : null;
        
        // Try Method B: Default export init
        if (!rp && runpod.default) {
            rp = typeof runpod.default === 'function' ? runpod.default(process.env.RUNPOD_API_KEY) : runpod.default;
        }

        // Try Method C: Direct property access
        const startServerless = (rp && rp.serverless) || runpod.serverless || (runpod.default && runpod.default.serverless);

        if (typeof startServerless === 'function') {
            startServerless(handler);
        } else {
            console.error("SDK Structure:", Object.keys(runpod));
            throw new Error("All initialization methods failed to find .serverless");
        }
    } catch (err: any) {
        console.error("RunPod Critical Failure:", err.message);
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

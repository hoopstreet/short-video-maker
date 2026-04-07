import * as serverModule from "./server/server";

const app = (serverModule as any).default || (serverModule as any).app || serverModule;

async function handler(event: any) {
  console.log("RunPod Job Received:", event.id);
  return { status: "success", message: "Worker Active", input: event.input };
}

if (process.env.RUNPOD_API_KEY) {
    console.log("Starting RunPod Worker...");
    try {
        // Use a standard require to avoid Vite bundling issues
        const rpSDK = require("runpod-sdk");
        
        // Find the actual worker start function
        const startFn = rpSDK.start || (rpSDK.default && rpSDK.default.start) || rpSDK.serverless;

        if (typeof startFn === 'function') {
            startFn({ handler });
        } else {
            // Last ditch effort: try to initialize if it's a factory function
            const instance = typeof rpSDK === 'function' ? rpSDK(process.env.RUNPOD_API_KEY) : rpSDK;
            if (instance && typeof instance.start === 'function') {
                instance.start({ handler });
            } else {
                console.error("SDK Export Keys:", Object.keys(rpSDK));
                throw new Error("Could not locate start or serverless function.");
            }
        }
    } catch (err: any) {
        console.error("Worker Critical Failure:", err.message);
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

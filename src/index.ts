import * as runpod from "runpod-sdk";
import * as serverModule from "./server/server";

const app = (serverModule as any).default || (serverModule as any).app || serverModule;

async function handler(event: any) {
  console.log("RunPod Job Received:", event.id);
  // event.input contains the data sent from Hugging Face
  return { status: "success", message: "Worker successfully processed the job" };
}

if (process.env.RUNPOD_API_KEY) {
    console.log("Starting in RunPod Serverless mode using .start()...");
    try {
        // Based on your logs, the SDK has a 'default' or is the object itself
        const rp: any = (runpod as any).default || runpod;
        
        // In the official Node.js SDK, 'start' is the method for workers
        if (typeof rp.start === 'function') {
            rp.start({
                handler: handler
            });
        } else {
            console.error("Available methods:", Object.keys(rp));
            throw new Error("Could not find .start() or .serverless() in SDK");
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

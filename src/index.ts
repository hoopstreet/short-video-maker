import runpod from "runpod-sdk";
import * as serverModule from "./server/server";

// Find the express app in the module
const app = (serverModule as any).default || (serverModule as any).app || serverModule;

async function handler(event: any) {
  console.log("RunPod Job Received:", event.id);
  // Placeholder for video generation logic
  return { status: "success", message: "Job processed" };
}

if (process.env.RUNPOD_API_KEY) {
    console.log("Starting in RunPod Serverless mode...");
    // Initialize and call serverless directly
    const rp = runpod(process.env.RUNPOD_API_KEY);
    rp.serverless(handler);
} else {
    const port = process.env.PORT || 3123;
    if (app && typeof app.listen === 'function') {
        app.listen(port, () => {
            console.log(`Server running locally on port ${port}`);
        });
    } else {
        console.error("Express app not found. Check your exports.");
    }
}

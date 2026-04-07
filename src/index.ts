import * as runpodSdk from "runpod-sdk";
import * as serverModule from "./server/server";

// Handle both default and named exports for the express app
const app = (serverModule as any).default || (serverModule as any).app || serverModule;

// Initialize RunPod
const rp = (runpodSdk as any).default ? (runpodSdk as any).default(process.env.RUNPOD_API_KEY || "") : (runpodSdk as any)(process.env.RUNPOD_API_KEY || "");

async function handler(event: any) {
  console.log("RunPod Job Received:", event.id);
  return { status: "success", message: "Worker is active" };
}

if (process.env.RUNPOD_API_KEY) {
    console.log("Starting in RunPod Serverless mode...");
    rp.serverless(handler);
} else {
    const port = process.env.PORT || 3123;
    if (app.listen) {
        app.listen(port, () => {
            console.log(`Server running locally on port ${port}`);
        });
    } else {
        console.error("Could not find a valid Express app to start.");
    }
}

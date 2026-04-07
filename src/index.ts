import runpod from "@runpod/sdk";
import * as serverModule from "./server/server";

// Find the express app
const app = (serverModule as any).default || (serverModule as any).app || serverModule;

// The function that RunPod will trigger
async function handler(event: any) {
  console.log("RunPod Job Received:", event.id);
  // The worker logic
  return { 
    status: "success", 
    message: "Node.js Worker is active and connected",
    input: event.input 
  };
}

if (process.env.RUNPOD_API_KEY) {
    console.log("Initializing RunPod Serverless Worker via @runpod/sdk...");
    // This keeps the container alive and polling the queue
    runpod.serverless(handler);
} else {
    const port = process.env.PORT || 3123;
    if (app && typeof app.listen === 'function') {
        app.listen(port, () => console.log(`Local server running on port ${port}`));
    } else {
        process.exit(1);
    }
}

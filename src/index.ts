import runpod from "runpod";
import * as serverModule from "./server/server";

const app = (serverModule as any).default || (serverModule as any).app || serverModule;

async function handler(event: any) {
  console.log("RunPod Job Received:", event.id);
  return { 
    status: "success", 
    message: "Node.js Worker is active",
    input: event.input 
  };
}

if (process.env.RUNPOD_API_KEY) {
    console.log("Initializing RunPod Serverless Worker via runpod SDK...");
    // Use the verified start method for the 'runpod' npm package
    runpod.serverless(handler);
} else {
    const port = process.env.PORT || 3123;
    if (app && typeof app.listen === 'function') {
        app.listen(port, () => console.log(`Local server running on port ${port}`));
    } else {
        process.exit(1);
    }
}

import runpodSdk from "runpod-sdk";
import app from "./server/server";

// Initialize the SDK with the API key from environment
const rp = runpodSdk(process.env.RUNPOD_API_KEY || "");

async function handler(event: any) {
  console.log("RunPod Job Received:", event.id);
  // This is a placeholder for your generation logic
  return { status: "success", message: "Job received by worker" };
}

if (process.env.RUNPOD_API_KEY) {
    console.log("Starting in RunPod Serverless mode...");
    rp.serverless(handler);
} else {
    const port = process.env.PORT || 3123;
    // Check if app has a listen method (handles both named and default exports)
    const server = (app as any).listen ? app : (app as any).app;
    server.listen(port, () => {
        console.log(`Server running locally on port ${port}`);
    });
}

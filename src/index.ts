import runpod from "runpod-sdk";
import { app } from "./server/server";

// Function to handle the RunPod event and pass it to our Express app
async function handler(event: any) {
  // RunPod sends the request body in event.input
  // This is where your video generation logic is triggered
  console.log("RunPod Job Received:", event.id);
  
  // For now, we allow the server to handle internal routing
  // If you are using standard POST requests, we keep it simple:
  return { status: "success", message: "Job started on RunPod" };
}

if (process.env.RUNPOD_API_KEY) {
    console.log("Starting in RunPod Serverless mode...");
    runpod.serverless(handler);
} else {
    const port = process.env.PORT || 3123;
    app.listen(port, () => {
        console.log(`Server running locally on port ${port}`);
    });
}

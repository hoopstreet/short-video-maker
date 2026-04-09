import React, { useState } from 'react';
import axios from 'axios';
import { Button, Box, CircularProgress } from '@mui/material';

const VideoCreator: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleCreateVideo = async () => {
    setLoading(true);
    try {
      // Accessing env via string index to bypass CommonJS compiler check
      const env = (import.meta as any)["env"];
      const apiKey = env?.VITE_RUNPOD_API_KEY || "";
      
      await axios.post(
        "https://api.runpod.ai/v2/6z2bkikvblpg02/runsync",
        {
          input: {
            scenes: [], 
            config: {}
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      alert("Video generation started on RunPod!");
    } catch (error) {
      console.error(error);
      alert("Failed to connect to RunPod.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button 
        variant="contained" 
        onClick={handleCreateVideo} 
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Create Video"}
      </Button>
    </Box>
  );
};

export default VideoCreator;

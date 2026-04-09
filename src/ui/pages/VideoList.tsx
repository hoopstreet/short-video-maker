import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Box, List, ListItem, ListItemButton, ListItemText, 
  Typography, Paper, CircularProgress, IconButton 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const response = await axios.get('/api/short-videos');
      setVideos(response.data.videos || []);
    } catch (error) {
      console.error("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Generated Videos</Typography>
      <Paper elevation={2}>
        <List>
          {videos.map((video) => (
            <ListItem 
              key={video.id}
              disablePadding
              secondaryAction={
                <IconButton edge="end" aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemButton onClick={() => window.open(`/api/short-video/${video.id}`, '_blank')}>
                <ListItemText 
                  primary={video.id} 
                  secondary={`Status: ${video.status}`} 
                />
              </ListItemButton>
            </ListItem>
          ))}
          {videos.length === 0 && (
            <ListItem><ListItemText primary="No videos found" /></ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default VideoList;

FROM hoopstreet/short-video-maker:latest-cuda
EXPOSE 3123
CMD ["node", "src/server.js"]

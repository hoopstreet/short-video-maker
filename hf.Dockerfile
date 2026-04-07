FROM hoopstreet/short-video-maker:latest-tiny
EXPOSE 3123
CMD ["node", "src/server.js"]

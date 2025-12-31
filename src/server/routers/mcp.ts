import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import z from "zod";

import { ShortCreator } from "../../short-creator/ShortCreator";
import { logger } from "../../logger";
import {
  renderConfig,
  sceneInput,
  type RenderConfig,
  type SceneInput,
} from "../../types/shorts";

export class MCPRouter {
  router: express.Router;
  shortCreator: ShortCreator;
  transports: { [sessionId: string]: SSEServerTransport } = {};
  mcpServer: McpServer;
  constructor(shortCreator: ShortCreator) {
    this.router = express.Router();
    this.shortCreator = shortCreator;

    this.mcpServer = new McpServer({
      name: "Short Creator",
      version: "0.0.1",
    });

    this.setupMCPServer();
    this.setupRoutes();
  }

  private setupMCPServer() {
    this.mcpServer.registerTool(
      "get-video-status",
      {
        description: "Get the status of a video (ready, processing, failed)",
        inputSchema: z.object({
          videoId: z.string().describe("The ID of the video"),
        }) as any,
      },
      async (args: any) => {
        const { videoId } = args;
        const status = this.shortCreator.status(videoId);
        return {
          content: [
            {
              type: "text" as const,
              text: status,
            },
          ],
        };
      },
    );

    this.mcpServer.registerTool(
      "create-short-video",
      {
        description: "Create a short video from a list of scenes",
        inputSchema: z.object({
          scenes: z.array(sceneInput),
          config: renderConfig,
        }) as any,
      },
      async (args: any) => {
        const { scenes, config } = args;
        const videoId = await this.shortCreator.addToQueue(scenes, config);

        return {
          content: [
            {
              type: "text" as const,
              text: videoId,
            },
          ],
        };
      },
    );
  }

  private setupRoutes() {
    this.router.get("/sse", async (req, res) => {
      logger.info("SSE GET request received");

      const transport = new SSEServerTransport("/mcp/messages", res);
      this.transports[transport.sessionId] = transport;
      res.on("close", () => {
        delete this.transports[transport.sessionId];
      });
      await this.mcpServer.connect(transport);
    });

    this.router.post("/messages", async (req, res) => {
      logger.info("SSE POST request received");

      const sessionId = req.query.sessionId as string;
      const transport = this.transports[sessionId];
      if (transport) {
        await transport.handlePostMessage(req, res);
      } else {
        res.status(400).send("No transport found for sessionId");
      }
    });
  }
}

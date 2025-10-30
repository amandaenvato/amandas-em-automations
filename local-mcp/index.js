#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { PlaywrightMCPClient } from "./src/playwright-mcp-client.js";
import { CultureAmpNotesExtractor } from "./src/culture-amp-extractor.js";

class LocalMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "local-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.playwrightClient = new PlaywrightMCPClient();
    this.extractor = new CultureAmpNotesExtractor(this.playwrightClient);
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "get_culture_amp_notes",
            description: "Extract Culture Amp 1-on-1 conversation notes for a given Culture Amp ID",
            inputSchema: {
              type: "object",
              properties: {
                culture_amp_id: {
                  type: "string",
                  description: "Culture Amp ID to extract notes for",
                },
                base_url: {
                  type: "string",
                  description: "Base Culture Amp URL (defaults to envato.cultureamp.com)",
                  default: "https://envato.cultureamp.com",
                },
              },
              required: ["culture_amp_id"],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === "get_culture_amp_notes") {
        return await this.extractor.extractNotes(args?.culture_amp_id, args?.base_url);
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Local MCP server running on stdio");
  }
}

// Start the server
const server = new LocalMCPServer();
server.run().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

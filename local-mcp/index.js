#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { fileURLToPath } from "url";
import { CursorAgentClient } from "./src/cursor-agent-client.js";

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

    this.cursorAgentClient = new CursorAgentClient();
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    const listToolsHandler = async () => {
      return {
        tools: [
          {
            name: "start_cursor_agent",
            description:
              "Start a new Cursor agent using the Cursor Agent API. The agent will work autonomously on the specified repository.",
            inputSchema: {
              type: "object",
              properties: {
                repository_url: {
                  type: "string",
                  description:
                    "The GitHub repository URL where the agent will work (e.g., https://github.com/owner/repo)",
                },
                prompt: {
                  type: "string",
                  description:
                    "Instructions or tasks for the agent to perform",
                },
                branch_name: {
                  type: "string",
                  description:
                    "The branch name where the agent will apply changes (optional)",
                },
                agent_name: {
                  type: "string",
                  description:
                    "A descriptive name for the agent (optional)",
                },
                auto_create_pull_request: {
                  type: "boolean",
                  description:
                    "Whether the agent should automatically create a pull request with its changes (default: false)",
                  default: false,
                },
                model: {
                  type: "string",
                  description:
                    "The AI model to use for the agent (default: composer-1)",
                  default: "composer-1",
                },
              },
              required: ["repository_url", "prompt"],
            },
          },
        ],
      };
    };

    // Handle tool calls
    const callToolHandler = async (request) => {
      const { name, arguments: args } = request.params;

      if (name === "start_cursor_agent") {
        return await this.cursorAgentClient.startAgent(args || {});
      }

      throw new Error(`Unknown tool: ${name}`);
    };

    // Store handlers for testing
    this._listToolsHandler = listToolsHandler;
    this._callToolHandler = callToolHandler;

    // Register handlers with server
    this.server.setRequestHandler(ListToolsRequestSchema, listToolsHandler);
    this.server.setRequestHandler(CallToolRequestSchema, callToolHandler);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Local MCP server running on stdio");
  }
}

// Export for testing
export { LocalMCPServer };

// Start the server only if this is the main module (not imported)
// Check if the current file is being run directly vs imported
const isMainModule = (() => {
  if (!process.argv[1]) return false;
  const currentFile = fileURLToPath(import.meta.url);
  const mainFile = process.argv[1];
  // Normalize paths for comparison (handle relative/absolute paths)
  return currentFile === mainFile || currentFile.endsWith(mainFile) || mainFile.endsWith(currentFile);
})();

if (isMainModule) {
  const server = new LocalMCPServer();
  server.run().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}

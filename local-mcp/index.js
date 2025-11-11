#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { fileURLToPath } from "url";
import { CursorAgentClient } from "./src/cursor-agent-client.js";
import { GitHubCLI } from "./src/github-cli.js";
import { OpenAIClient } from "./src/openai-client.js";
import { CultureAmpClient } from "./src/cultureamp-client.js";
import { BrowserClient } from "./src/browser-client.js";

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
    this.githubCLI = new GitHubCLI();
    this.openAIClient = new OpenAIClient();
    this.browserClient = new BrowserClient();
    // Culture Amp client is created on-demand with tokens from browser extraction
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
          {
            name: "gh_repo_list",
            description: "List repositories in the envato organization using gh CLI",
            inputSchema: {
              type: "object",
              properties: {
                limit: {
                  type: "number",
                  description: "Maximum number of repositories to return (optional)",
                },
              },
              required: [],
            },
          },
          {
            name: "gh_repo_view",
            description: "View details of a specific repository using gh CLI",
            inputSchema: {
              type: "object",
              properties: {
                repo: {
                  type: "string",
                  description: "Repository in format 'owner/repo' (e.g., 'envato/repo-name')",
                },
              },
              required: ["repo"],
            },
          },
          {
            name: "gh_pr_list",
            description: "List pull requests using gh CLI",
            inputSchema: {
              type: "object",
              properties: {
                repo: {
                  type: "string",
                  description: "Repository in format 'owner/repo' (optional, defaults to current repo)",
                },
                state: {
                  type: "string",
                  description: "Filter by state: open, closed, or all (optional)",
                  enum: ["open", "closed", "all"],
                },
                author: {
                  type: "string",
                  description: "Filter by author username (optional)",
                },
                limit: {
                  type: "number",
                  description: "Maximum number of PRs to return (optional)",
                },
              },
              required: [],
            },
          },
          {
            name: "gh_pr_view",
            description: "View details of a specific pull request using gh CLI",
            inputSchema: {
              type: "object",
              properties: {
                pr_number: {
                  type: "number",
                  description: "Pull request number",
                },
                repo: {
                  type: "string",
                  description: "Repository in format 'owner/repo' (optional, defaults to current repo)",
                },
              },
              required: ["pr_number"],
            },
          },
          {
            name: "gh_search_code",
            description: "Search code using gh CLI",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query string",
                },
                repo: {
                  type: "string",
                  description: "Repository in format 'owner/repo' to search within (optional)",
                },
                limit: {
                  type: "number",
                  description: "Maximum number of results to return (optional)",
                },
              },
              required: ["query"],
            },
          },
          {
            name: "gh_search_prs",
            description: "Search pull requests using gh CLI",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query string",
                },
                repo: {
                  type: "string",
                  description: "Repository in format 'owner/repo' to search within (optional)",
                },
                state: {
                  type: "string",
                  description: "Filter by state: open, closed, or all (optional)",
                  enum: ["open", "closed", "all"],
                },
                author: {
                  type: "string",
                  description: "Filter by author username (optional)",
                },
                limit: {
                  type: "number",
                  description: "Maximum number of results to return (optional)",
                },
              },
              required: ["query"],
            },
          },
          {
            name: "gh_search_commits",
            description: "Search commits using gh CLI",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query string",
                },
                repo: {
                  type: "string",
                  description: "Repository in format 'owner/repo' to search within (optional)",
                },
                author: {
                  type: "string",
                  description: "Filter by author username (optional)",
                },
                limit: {
                  type: "number",
                  description: "Maximum number of results to return (optional)",
                },
              },
              required: ["query"],
            },
          },
          {
            name: "ask_openai",
            description: "Pass a prompt to OpenAI and wait for the response",
            inputSchema: {
              type: "object",
              properties: {
                prompt: {
                  type: "string",
                  description: "The prompt/question to send to OpenAI",
                },
                model: {
                  type: "string",
                  description: "The model to use (default: 'gpt-5-nano')",
                  default: "gpt-5-nano",
                },
              },
              required: ["prompt"],
            },
          },
          {
            name: "extract_cookies",
            description: "Extract cookies from a page after navigating to it and waiting for indicators that it has loaded and logged in",
            inputSchema: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "The URL to navigate to",
                },
                cookieNames: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Array of cookie names to extract (e.g., ['token', 'refresh-token']). If empty, extracts all cookies.",
                },
                waitForIndicators: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Array of text patterns (regex) or CSS selectors (prefixed with 'css:') to wait for. Examples: ['JW', 'css:.home-container', 'jonathan.williams@envato.com']. At least one indicator is required.",
                },
                maxWaitTime: {
                  type: "number",
                  description: "Maximum time to wait for indicators in milliseconds (default: 120000)",
                  default: 120000,
                },
                headless: {
                  type: "boolean",
                  description: "Whether to run browser in headless mode (default: false)",
                  default: false,
                },
              },
              required: ["url", "waitForIndicators"],
            },
          },
          {
            name: "cultureamp_get_conversation",
            description: "Get details about a Culture Amp conversation by its ID",
            inputSchema: {
              type: "object",
              properties: {
                conversation_id: {
                  type: "string",
                  description: "The conversation ID (UUID format, e.g., '0190791e-69f0-7057-939d-8bd02ca7b7b3')",
                },
                token: {
                  type: "string",
                  description: "Culture Amp JWT token (extracted from browser cookies)",
                },
                refresh_token: {
                  type: "string",
                  description: "Culture Amp refresh token (extracted from browser cookies)",
                },
              },
              required: ["conversation_id", "token", "refresh_token"],
            },
          },
          {
            name: "fetch_page",
            description: "Fetch a single page, wait for indicators that it has loaded and logged in, then return the page contents (HTML and text)",
            inputSchema: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "The URL to fetch",
                },
                waitForIndicators: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Array of text patterns (regex) or CSS selectors (prefixed with 'css:') to wait for (required). Examples: ['Saved', 'In progress', 'css:.inbox-container', 'jonathan.williams@envato.com']",
                },
                maxWaitTime: {
                  type: "number",
                  description: "Maximum time to wait for indicators in milliseconds (default: 120000)",
                  default: 120000,
                },
                headless: {
                  type: "boolean",
                  description: "Whether to run browser in headless mode (default: false)",
                  default: false,
                },
              },
              required: ["url", "waitForIndicators"],
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

      if (name === "gh_repo_list") {
        return await this.githubCLI.listRepos(args?.limit);
      }

      if (name === "gh_repo_view") {
        return await this.githubCLI.viewRepo(args?.repo);
      }

      if (name === "gh_pr_list") {
        return await this.githubCLI.listPRs(args?.repo, args?.state, args?.author, args?.limit);
      }

      if (name === "gh_pr_view") {
        return await this.githubCLI.viewPR(args?.pr_number, args?.repo);
      }

      if (name === "gh_search_code") {
        return await this.githubCLI.searchCode(args?.query, args?.repo, args?.limit);
      }

      if (name === "gh_search_prs") {
        return await this.githubCLI.searchPRs(args?.query, args?.repo, args?.state, args?.author, args?.limit);
      }

      if (name === "gh_search_commits") {
        return await this.githubCLI.searchCommits(args?.query, args?.repo, args?.author, args?.limit);
      }

      if (name === "ask_openai") {
        return await this.openAIClient.askOpenAI({
          prompt: args?.prompt,
          model: args?.model,
        });
      }

      if (name === "extract_cookies") {
        if (!args?.waitForIndicators || args.waitForIndicators.length === 0) {
          throw new Error("waitForIndicators is required. Provide at least one indicator to wait for.");
        }
        return await this.browserClient.extractCookies(
          args?.url,
          args?.cookieNames || [],
          args.waitForIndicators,
          args?.maxWaitTime || 120000,
          args?.headless || false
        );
      }

      if (name === "cultureamp_get_conversation") {
        if (!args?.token || !args?.refresh_token) {
          throw new Error(
            "Token and refresh_token are required. Use extract_cookies with Culture Amp specific arguments: " +
            "url='https://envato.cultureamp.com/app/home', " +
            "cookieNames=['cultureamp.production-us.token', 'cultureamp.production-us.refresh-token'], " +
            "waitForIndicators=['JW']"
          );
        }
        const cultureAmpClient = new CultureAmpClient(args.token, args.refresh_token);
        return await cultureAmpClient.getConversation(args.conversation_id);
      }

      if (name === "fetch_page") {
        return await this.browserClient.fetchPage(
          args?.url,
          args?.waitForIndicators || [],
          args?.maxWaitTime || 60000,
          args?.headless || false
        );
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

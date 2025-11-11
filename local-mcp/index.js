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
import { TickTickClient } from "./src/ticktick-client.js";
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
    this.tickTickClient = new TickTickClient();
    this.openAIClient = new OpenAIClient();
    this.browserClient = new BrowserClient();
    try {
      this.cultureAmpClient = new CultureAmpClient();
    } catch (error) {
      // Culture Amp client is optional - log warning but don't fail
      console.error("Warning: Culture Amp client not initialized:", error.message);
      this.cultureAmpClient = null;
    }
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
            name: "ticktick_get_pending_tasks",
            description: "Get pending (incomplete) tasks from TickTick",
            inputSchema: {
              type: "object",
              properties: {
                project: {
                  type: "string",
                  description: "Filter by project name (optional)",
                },
                priority: {
                  type: "string",
                  description: "Filter by priority: 'none', 'low', 'medium', or 'high' (optional)",
                  enum: ["none", "low", "medium", "high"],
                },
                limit: {
                  type: "number",
                  description: "Maximum number of tasks to return (optional)",
                },
              },
              required: [],
            },
          },
          {
            name: "ticktick_get_task_summary",
            description: "Get summary statistics of all tasks in TickTick",
            inputSchema: {
              type: "object",
              properties: {},
              required: [],
            },
          },
          {
            name: "ticktick_get_all_tasks",
            description: "Get all tasks (both complete and incomplete) from TickTick",
            inputSchema: {
              type: "object",
              properties: {
                project: {
                  type: "string",
                  description: "Filter by project name (optional)",
                },
                status: {
                  type: "string",
                  description: "Filter by status: 'incomplete' or 'complete' (optional)",
                  enum: ["incomplete", "complete"],
                },
                limit: {
                  type: "number",
                  description: "Maximum number of tasks to return (optional)",
                },
              },
              required: [],
            },
          },
          {
            name: "ticktick_update_task",
            description: "Update a TickTick task's title, description, tag, and/or due date",
            inputSchema: {
              type: "object",
              properties: {
                task_identifier: {
                  type: "string",
                  description: "Task title (exact match) or entity ID",
                },
                title: {
                  type: "string",
                  description: "New title for the task (optional)",
                },
                description: {
                  type: "string",
                  description: "New description/content for the task (optional)",
                },
                tag: {
                  type: "string",
                  description: "Tag to add to the task (optional, will append to existing tags)",
                },
                due_date: {
                  type: "string",
                  description: "Due date in format 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM:SS' (optional)",
                },
              },
              required: ["task_identifier"],
            },
          },
          {
            name: "ticktick_mark_task_done",
            description: "Mark a TickTick task as done (complete)",
            inputSchema: {
              type: "object",
              properties: {
                task_identifier: {
                  type: "string",
                  description: "Task title (exact match) or entity ID",
                },
              },
              required: ["task_identifier"],
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
            name: "brave_browser_navigate",
            description: "Open Brave browser, navigate to a URL, and return the page content",
            inputSchema: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "The URL to navigate to (e.g., https://envato.cultureamp.com/app/home)",
                },
              },
              required: ["url"],
            },
          },
          ...(this.cultureAmpClient ? [{
            name: "cultureamp_get_conversation",
            description: "Get details about a Culture Amp conversation by its ID",
            inputSchema: {
              type: "object",
              properties: {
                conversation_id: {
                  type: "string",
                  description: "The conversation ID (UUID format, e.g., '0190791e-69f0-7057-939d-8bd02ca7b7b3')",
                },
              },
              required: ["conversation_id"],
            },
          }] : []),
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

      if (name === "ticktick_get_pending_tasks") {
        return await this.tickTickClient.getPendingTasks(args?.project, args?.priority, args?.limit);
      }

      if (name === "ticktick_get_task_summary") {
        return await this.tickTickClient.getTaskSummary();
      }

      if (name === "ticktick_get_all_tasks") {
        return await this.tickTickClient.getAllTasks(args?.project, args?.status, args?.limit);
      }

      if (name === "ticktick_update_task") {
        return await this.tickTickClient.updateTask(
          args?.task_identifier,
          args?.title,
          args?.description,
          args?.tag,
          args?.due_date
        );
      }

      if (name === "ticktick_mark_task_done") {
        return await this.tickTickClient.markTaskDone(args?.task_identifier);
      }

      if (name === "ask_openai") {
        return await this.openAIClient.askOpenAI({
          prompt: args?.prompt,
          model: args?.model,
        });
      }

      if (name === "brave_browser_navigate") {
        return await this.browserClient.navigateAndGetContent(args?.url);
      }

      if (name === "cultureamp_get_conversation") {
        if (!this.cultureAmpClient) {
          throw new Error(
            "Culture Amp client not available. Please set CULTUREAMP_TOKEN and CULTUREAMP_REFRESH_TOKEN " +
            "environment variables."
          );
        }
        return await this.cultureAmpClient.getConversation(args?.conversation_id);
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

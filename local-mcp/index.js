#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { fileURLToPath } from "url";
import { CursorAgentClient } from "./src/cursor-agent-client.js";
import { GitHubCLI, ALLOWED_COMMANDS } from "./src/github-cli.js";
import { OpenAIClient } from "./src/openai-client.js";
import { CultureAmpClient } from "./src/cultureamp-client.js";
import { BrowserClient } from "./src/browser-client.js";
import { BambooHRClient } from "./src/bamboohr-client.js";
import { PagerDutyClient } from "./src/pagerduty-client.js";
import { PagerDutyOAuth } from "./src/pagerduty-oauth.js";
import { TrelloClient } from "./src/trello-client.js";

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
    // BambooHR client is created on-demand with subdomain and API key from env vars
    this.pagerDutyOAuth = new PagerDutyOAuth();
    this.setupToolHandlers();
  }

  /**
   * Get PagerDuty client with OAuth token or cookies
   * @private
   */
  async getPagerDutyClient(cookies = null) {
    // Try OAuth token first
    try {
      const token = await this.pagerDutyOAuth.getAccessToken(false, true); // Use cached token, headless
      return new PagerDutyClient(token);
    } catch (error) {
      // If OAuth fails, try cookies if provided
      if (cookies) {
        return new PagerDutyClient(cookies);
      }
      // If no cookies and OAuth fails, throw error with helpful message
      throw new Error(
        `PagerDuty authentication failed. OAuth error: ${error.message}. ` +
        `Either complete OAuth flow (set PAGERDUTY_CLIENT_ID and PAGERDUTY_CLIENT_SECRET) ` +
        `or provide cookies via extract_cookies tool.`
      );
    }
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
            name: "gh_execute",
            description: "Execute a read-only GitHub CLI command. Only commands from the whitelist are permitted. Write operations are blocked.",
            inputSchema: {
              type: "object",
              properties: {
                command: {
                  type: "string",
                  enum: ALLOWED_COMMANDS,
                  description: "The command key to execute (e.g., 'repo-list', 'pr-view'). Must be one of the allowed read-only command keys.",
                },
                args: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of arguments to pass to the command (e.g., ['envato', '--limit', '10']). Optional.",
                  default: [],
                },
              },
              required: ["command"],
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
                  description: "The model to use (default: 'gpt-5')",
                  default: "gpt-5",
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
          {
            name: "cultureamp_add_topic",
            description: "Add a topic to a Culture Amp conversation using browser automation",
            inputSchema: {
              type: "object",
              properties: {
                conversation_url: {
                  type: "string",
                  description: "The full URL to the Culture Amp conversation (e.g., 'https://envato.cultureamp.com/app/conversations/019a25d1-97d6-707b-8c0e-c46015a0b082')",
                },
                topic_title: {
                  type: "string",
                  description: "The title of the topic to add",
                },
                topic_notes: {
                  type: "string",
                  description: "Optional notes/description to add to the topic (can include links)",
                },
                waitForIndicators: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Array of text patterns (regex) or CSS selectors (prefixed with 'css:') to wait for (default: ['JW'])",
                  default: ["JW"],
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
              required: ["conversation_url", "topic_title"],
            },
          },
          {
            name: "cultureamp_add_private_note",
            description: "Add a private note to a Culture Amp conversation Personal notes tab using browser automation",
            inputSchema: {
              type: "object",
              properties: {
                conversation_url: {
                  type: "string",
                  description: "The full URL to the Culture Amp conversation (e.g., 'https://envato.cultureamp.com/app/conversations/019a25d1-97d6-707b-8c0e-c46015a0b082')",
                },
                note_text: {
                  type: "string",
                  description: "The text of the private note to add",
                },
                waitForIndicators: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Array of text patterns (regex) or CSS selectors (prefixed with 'css:') to wait for (default: ['JW'])",
                  default: ["JW"],
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
              required: ["conversation_url", "note_text"],
            },
          },
          {
            name: "bamboohr_list_employees",
            description: "List all employees from the BambooHR directory",
            inputSchema: {
              type: "object",
              properties: {
                limit: {
                  type: "number",
                  description: "Limit the number of results returned",
                },
                fields: {
                  type: "string",
                  description: "Comma-separated list of fields to return (e.g., 'firstName,lastName,workEmail,jobTitle')",
                },
              },
            },
          },
          {
            name: "bamboohr_get_employee",
            description: "Get a specific employee by ID from BambooHR",
            inputSchema: {
              type: "object",
              properties: {
                employee_id: {
                  type: "string",
                  description: "The employee ID to retrieve",
                },
                fields: {
                  type: "string",
                  description: "Comma-separated list of fields to return (e.g., 'firstName,lastName,workEmail,jobTitle,department')",
                },
              },
              required: ["employee_id"],
            },
          },
          {
            name: "bamboohr_get_current_employee",
            description: "Get the current employee (API key owner) from BambooHR",
            inputSchema: {
              type: "object",
              properties: {
                fields: {
                  type: "string",
                  description: "Comma-separated list of fields to return (e.g., 'firstName,lastName,workEmail,jobTitle,department')",
                },
              },
            },
          },
          {
            name: "pagerduty_list_incidents",
            description: "List incidents from PagerDuty. Requires browser authentication cookies.",
            inputSchema: {
              type: "object",
              properties: {
                cookies: {
                  type: "string",
                  description: "PagerDuty authentication cookies (extracted from browser using extract_cookies tool)",
                },
                statuses: {
                  type: "string",
                  description: "Comma-separated list of statuses (triggered, acknowledged, resolved)",
                },
                urgencies: {
                  type: "string",
                  description: "Comma-separated list of urgencies (high, low)",
                },
                limit: {
                  type: "number",
                  description: "Number of results per page (default: 25)",
                },
                offset: {
                  type: "number",
                  description: "Offset for pagination",
                },
              },
              required: ["cookies"],
            },
          },
          {
            name: "pagerduty_get_incident",
            description: "Get a specific incident by ID from PagerDuty. Requires browser authentication cookies.",
            inputSchema: {
              type: "object",
              properties: {
                cookies: {
                  type: "string",
                  description: "PagerDuty authentication cookies (extracted from browser using extract_cookies tool)",
                },
                incident_id: {
                  type: "string",
                  description: "The incident ID",
                },
              },
              required: ["cookies", "incident_id"],
            },
          },
          {
            name: "pagerduty_list_schedules",
            description: "List on-call schedules from PagerDuty. Requires browser authentication cookies.",
            inputSchema: {
              type: "object",
              properties: {
                cookies: {
                  type: "string",
                  description: "PagerDuty authentication cookies (extracted from browser using extract_cookies tool)",
                },
                limit: {
                  type: "number",
                  description: "Number of results per page",
                },
                offset: {
                  type: "number",
                  description: "Offset for pagination",
                },
              },
              required: ["cookies"],
            },
          },
          {
            name: "pagerduty_get_oncall",
            description: "Get on-call users for a schedule from PagerDuty. Requires browser authentication cookies.",
            inputSchema: {
              type: "object",
              properties: {
                cookies: {
                  type: "string",
                  description: "PagerDuty authentication cookies (extracted from browser using extract_cookies tool)",
                },
                schedule_id: {
                  type: "string",
                  description: "The schedule ID",
                },
                since: {
                  type: "string",
                  description: "Start of the time range (ISO 8601 format)",
                },
                until: {
                  type: "string",
                  description: "End of the time range (ISO 8601 format)",
                },
              },
              required: ["cookies", "schedule_id"],
            },
          },
          {
            name: "pagerduty_list_services",
            description: "List services from PagerDuty. Requires browser authentication cookies.",
            inputSchema: {
              type: "object",
              properties: {
                cookies: {
                  type: "string",
                  description: "PagerDuty authentication cookies (extracted from browser using extract_cookies tool)",
                },
                limit: {
                  type: "number",
                  description: "Number of results per page",
                },
                offset: {
                  type: "number",
                  description: "Offset for pagination",
                },
              },
              required: ["cookies"],
            },
          },
          {
            name: "pagerduty_list_users",
            description: "List users from PagerDuty. Requires browser authentication cookies.",
            inputSchema: {
              type: "object",
              properties: {
                cookies: {
                  type: "string",
                  description: "PagerDuty authentication cookies (extracted from browser using extract_cookies tool)",
                },
                query: {
                  type: "string",
                  description: "Search query (searches name, email)",
                },
                limit: {
                  type: "number",
                  description: "Number of results per page",
                },
                offset: {
                  type: "number",
                  description: "Offset for pagination",
                },
              },
              required: ["cookies"],
            },
          },
          {
            name: "pagerduty_get_user_oncall_hours",
            description: "Calculate total on-call hours for a user within a time range. Requires browser authentication cookies.",
            inputSchema: {
              type: "object",
              properties: {
                cookies: {
                  type: "string",
                  description: "PagerDuty authentication cookies (extracted from browser using extract_cookies tool)",
                },
                user_id: {
                  type: "string",
                  description: "The user ID",
                },
                start_date: {
                  type: "string",
                  description: "Start date in ISO 8601 format (e.g., '2025-11-01T00:00:00Z')",
                },
                end_date: {
                  type: "string",
                  description: "End date in ISO 8601 format (e.g., '2025-11-30T23:59:59Z')",
                },
                schedule_ids: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Optional array of schedule IDs to filter by",
                },
              },
              required: ["cookies", "user_id", "start_date", "end_date"],
            },
          },
          {
            name: "trello_get_board_id",
            description: "Get Trello board ID from URL or search by name. Returns both short ID (from URL) and full ID (from API).",
            inputSchema: {
              type: "object",
              properties: {
                board_identifier: {
                  type: "string",
                  description: "Board URL (e.g., 'https://trello.com/b/abc123/board-name'), board ID, or board name to search for",
                },
              },
              required: ["board_identifier"],
            },
          },
          {
            name: "trello_copy_lists",
            description: "Copy all lists and their cards from one Trello board to another",
            inputSchema: {
              type: "object",
              properties: {
                source_board_id: {
                  type: "string",
                  description: "Source board ID or URL",
                },
                destination_board_id: {
                  type: "string",
                  description: "Destination board ID or URL",
                },
              },
              required: ["source_board_id", "destination_board_id"],
            },
          },
          {
            name: "trello_move_lists_by_pattern",
            description: "Move lists matching a name pattern from source board to destination board. Lists are moved (not copied) with all their cards.",
            inputSchema: {
              type: "object",
              properties: {
                source_board_id: {
                  type: "string",
                  description: "Source board ID or URL",
                },
                destination_board_id: {
                  type: "string",
                  description: "Destination board ID or URL",
                },
                pattern: {
                  type: "string",
                  description: "Name pattern to match (case-insensitive, matches start of list name)",
                },
                dry_run: {
                  type: "boolean",
                  description: "If true, only preview what would be moved without making changes",
                  default: false,
                },
              },
              required: ["source_board_id", "destination_board_id", "pattern"],
            },
          },
          {
            name: "trello_archive_lists_by_range",
            description: "Archive lists by number range (1-based indexing)",
            inputSchema: {
              type: "object",
              properties: {
                board_id: {
                  type: "string",
                  description: "Board ID or URL",
                },
                start_num: {
                  type: "number",
                  description: "Start list number (1-based)",
                },
                end_num: {
                  type: "number",
                  description: "End list number (1-based)",
                },
                dry_run: {
                  type: "boolean",
                  description: "If true, only preview what would be archived without making changes",
                  default: false,
                },
              },
              required: ["board_id", "start_num", "end_num"],
            },
          },
          {
            name: "trello_reset_retro_board",
            description: "Reset retrospective board by renaming lists with date and creating new empty lists",
            inputSchema: {
              type: "object",
              properties: {
                source_board_id: {
                  type: "string",
                  description: "Source board ID or URL",
                },
                destination_board_id: {
                  type: "string",
                  description: "Destination board ID or URL for archived lists",
                },
                start_list_num: {
                  type: "number",
                  description: "Start list number (1-based)",
                },
                end_list_num: {
                  type: "number",
                  description: "End list number (1-based)",
                },
                date: {
                  type: "string",
                  description: "Date to append to list names in ISO format (YYYY-MM-DD). Defaults to 2 weeks ago if not provided.",
                },
              },
              required: ["source_board_id", "destination_board_id", "start_list_num", "end_list_num"],
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

      if (name === "gh_execute") {
        return await this.githubCLI.executeReadOnlyCommand(
          args?.command,
          args?.args || []
        );
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

      if (name === "cultureamp_add_topic") {
        if (!args?.conversation_url || !args?.topic_title) {
          throw new Error("conversation_url and topic_title are required");
        }
        return await this.browserClient.addCultureAmpTopic(
          args.conversation_url,
          args.topic_title,
          args?.topic_notes || null,
          args?.waitForIndicators || ['JW'],
          args?.maxWaitTime || 120000,
          args?.headless || false
        );
      }

      if (name === "cultureamp_add_private_note") {
        if (!args?.conversation_url || !args?.note_text) {
          throw new Error("conversation_url and note_text are required");
        }
        return await this.browserClient.addCultureAmpPrivateNote(
          args.conversation_url,
          args.note_text,
          args?.waitForIndicators || ['JW'],
          args?.maxWaitTime || 120000,
          args?.headless || false
        );
      }

      if (name === "bamboohr_list_employees") {
        const subdomain = process.env.BAMBOOHR_SUBDOMAIN;
        const apiKey = process.env.BAMBOOHR_API_KEY;
        if (!subdomain || !apiKey) {
          throw new Error(
            "BambooHR configuration required. Set BAMBOOHR_SUBDOMAIN and BAMBOOHR_API_KEY environment variables."
          );
        }
        const bamboohrClient = new BambooHRClient(subdomain, apiKey);
        const data = await bamboohrClient.listEmployees({
          limit: args?.limit,
          fields: args?.fields,
        });
        return {
          content: [
            {
              type: "text",
              text: bamboohrClient.formatEmployeeDirectory(data),
            },
          ],
        };
      }

      if (name === "bamboohr_get_employee") {
        const subdomain = process.env.BAMBOOHR_SUBDOMAIN;
        const apiKey = process.env.BAMBOOHR_API_KEY;
        if (!subdomain || !apiKey) {
          throw new Error(
            "BambooHR configuration required. Set BAMBOOHR_SUBDOMAIN and BAMBOOHR_API_KEY environment variables."
          );
        }
        if (!args?.employee_id) {
          throw new Error("employee_id is required");
        }
        const bamboohrClient = new BambooHRClient(subdomain, apiKey);
        const data = await bamboohrClient.getEmployee(args.employee_id, {
          fields: args?.fields,
        });
        return {
          content: [
            {
              type: "text",
              text: bamboohrClient.formatEmployee(data),
            },
          ],
        };
      }

      if (name === "bamboohr_get_current_employee") {
        const subdomain = process.env.BAMBOOHR_SUBDOMAIN;
        const apiKey = process.env.BAMBOOHR_API_KEY;
        if (!subdomain || !apiKey) {
          throw new Error(
            "BambooHR configuration required. Set BAMBOOHR_SUBDOMAIN and BAMBOOHR_API_KEY environment variables."
          );
        }
        const bamboohrClient = new BambooHRClient(subdomain, apiKey);
        const data = await bamboohrClient.getCurrentEmployee({
          fields: args?.fields,
        });
        return {
          content: [
            {
              type: "text",
              text: bamboohrClient.formatEmployee(data),
            },
          ],
        };
      }

      if (name === "pagerduty_list_incidents") {
        const pagerdutyClient = await this.getPagerDutyClient(args?.cookies);
        const data = await pagerdutyClient.listIncidents({
          statuses: args?.statuses,
          urgencies: args?.urgencies,
          limit: args?.limit,
          offset: args?.offset,
        });
        return {
          content: [
            {
              type: "text",
              text: pagerdutyClient.formatIncidents(data),
            },
          ],
        };
      }

      if (name === "pagerduty_get_incident") {
        if (!args?.incident_id) {
          throw new Error("incident_id is required");
        }
        const pagerdutyClient = await this.getPagerDutyClient(args?.cookies);
        const data = await pagerdutyClient.getIncident(args.incident_id);
        return {
          content: [
            {
              type: "text",
              text: pagerdutyClient.formatIncident(data),
            },
          ],
        };
      }

      if (name === "pagerduty_list_schedules") {
        const pagerdutyClient = await this.getPagerDutyClient(args?.cookies);
        const data = await pagerdutyClient.listSchedules({
          limit: args?.limit,
          offset: args?.offset,
        });
        return {
          content: [
            {
              type: "text",
              text: pagerdutyClient.formatSchedules(data),
            },
          ],
        };
      }

      if (name === "pagerduty_get_oncall") {
        if (!args?.schedule_id) {
          throw new Error("schedule_id is required");
        }
        const pagerdutyClient = await this.getPagerDutyClient(args?.cookies);
        const data = await pagerdutyClient.getOnCall(args.schedule_id, {
          since: args?.since,
          until: args?.until,
        });
        return {
          content: [
            {
              type: "text",
              text: pagerdutyClient.formatOnCall(data),
            },
          ],
        };
      }

      if (name === "pagerduty_list_services") {
        const pagerdutyClient = await this.getPagerDutyClient(args?.cookies);
        const data = await pagerdutyClient.listServices({
          limit: args?.limit,
          offset: args?.offset,
        });
        return {
          content: [
            {
              type: "text",
              text: pagerdutyClient.formatServices(data),
            },
          ],
        };
      }

      if (name === "pagerduty_list_users") {
        const pagerdutyClient = await this.getPagerDutyClient(args?.cookies);
        const data = await pagerdutyClient.listUsers({
          query: args?.query,
          limit: args?.limit,
          offset: args?.offset,
        });
        return {
          content: [
            {
              type: "text",
              text: pagerdutyClient.formatUsers(data),
            },
          ],
        };
      }

      if (name === "pagerduty_get_user_oncall_hours") {
        if (!args?.user_id) {
          throw new Error("user_id is required");
        }
        if (!args?.start_date) {
          throw new Error("start_date is required");
        }
        if (!args?.end_date) {
          throw new Error("end_date is required");
        }
        const pagerdutyClient = await this.getPagerDutyClient(args?.cookies);
        const hours = await pagerdutyClient.calculateOnCallHours(
          args.user_id,
          args.start_date,
          args.end_date,
          args?.schedule_ids
        );
        return {
          content: [
            {
              type: "text",
              text: `# On-Call Hours\n\n**User ID**: ${args.user_id}\n\n**Time Range**: ${args.start_date} to ${args.end_date}\n\n**Total Hours**: ${hours.toFixed(2)} hours\n\n**Total Days**: ${(hours / 24).toFixed(2)} days`,
            },
          ],
        };
      }

      // Trello tools
      if (name === "trello_get_board_id" || 
          name === "trello_copy_lists" || 
          name === "trello_move_lists_by_pattern" || 
          name === "trello_archive_lists_by_range" || 
          name === "trello_reset_retro_board") {
        const apiKey = process.env.TRELLO_API_KEY;
        const apiToken = process.env.TRELLO_API_TOKEN;
        if (!apiKey || !apiToken) {
          throw new Error(
            "Trello configuration required. Set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables. " +
            "Get your API key from https://trello.com/app-key and generate a token at " +
            "https://trello.com/1/authorize?key=<your_api_key>&name=TrelloHelper&expiration=never&response_type=token&scope=read,write"
          );
        }
        const trelloClient = new TrelloClient(apiKey, apiToken);

        if (name === "trello_get_board_id") {
          const boardInfo = await trelloClient.getBoardId(args.board_identifier);
          return {
            content: [
              {
                type: "text",
                text: trelloClient.formatBoardId(boardInfo),
              },
            ],
          };
        }

        if (name === "trello_copy_lists") {
          const sourceBoardInfo = await trelloClient.getBoardId(args.source_board_id);
          const destBoardInfo = await trelloClient.getBoardId(args.destination_board_id);
          const result = await trelloClient.copyLists(sourceBoardInfo.fullId, destBoardInfo.fullId);
          return {
            content: [
              {
                type: "text",
                text: trelloClient.formatCopyListsResult(result),
              },
            ],
          };
        }

        if (name === "trello_move_lists_by_pattern") {
          const sourceBoardInfo = await trelloClient.getBoardId(args.source_board_id);
          const destBoardInfo = await trelloClient.getBoardId(args.destination_board_id);
          const result = await trelloClient.moveListsByPattern(
            sourceBoardInfo.fullId,
            destBoardInfo.fullId,
            args.pattern,
            args?.dry_run || false
          );
          return {
            content: [
              {
                type: "text",
                text: trelloClient.formatMoveListsResult(result),
              },
            ],
          };
        }

        if (name === "trello_archive_lists_by_range") {
          const boardInfo = await trelloClient.getBoardId(args.board_id);
          const result = await trelloClient.archiveListsByRange(
            boardInfo.fullId,
            args.start_num,
            args.end_num,
            args?.dry_run || false
          );
          return {
            content: [
              {
                type: "text",
                text: trelloClient.formatArchiveListsResult(result),
              },
            ],
          };
        }

        if (name === "trello_reset_retro_board") {
          const sourceBoardInfo = await trelloClient.getBoardId(args.source_board_id);
          const destBoardInfo = await trelloClient.getBoardId(args.destination_board_id);
          const date = args?.date ? new Date(args.date) : null;
          const result = await trelloClient.resetRetroBoard(
            sourceBoardInfo.fullId,
            destBoardInfo.fullId,
            args.start_list_num,
            args.end_list_num,
            date
          );
          return {
            content: [
              {
                type: "text",
                text: trelloClient.formatResetRetroResult(result),
              },
            ],
          };
        }
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

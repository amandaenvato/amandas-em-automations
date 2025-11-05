# Local MCP Server

A custom MCP (Model Context Protocol) server that provides tools for interacting with the Cursor Agent API, GitHub CLI, TickTick, OpenAI, and Culture Amp.

## Overview

This server provides **13 tools** organized into 5 categories:
- **Cursor Agent API** (1 tool) - Autonomous agent management
- **GitHub CLI** (7 tools) - Repository, PR, code, and commit search
- **TickTick** (3 tools) - Task management and tracking
- **OpenAI** (1 tool) - Direct AI API access
- **Culture Amp** (1 tool, optional) - Conversation analysis

## Features

This server provides the following tools organized by category:

### Cursor Agent API

- **`start_cursor_agent`** - Start a new Cursor agent using the Cursor Agent API
  - **Required Parameters:**
    - `repository_url` (string): The GitHub repository URL where the agent will work (e.g., `https://github.com/owner/repo`)
    - `prompt` (string): Instructions or tasks for the agent to perform
  - **Optional Parameters:**
    - `branch_name` (string): The branch name where the agent will apply changes
    - `agent_name` (string): A descriptive name for the agent
    - `auto_create_pull_request` (boolean): Whether to automatically create a pull request (default: `false`)
    - `model` (string): The AI model to use (default: `"composer-1"`)

  **Note**: The Cursor API key must be provided via the `CURSOR_API_KEY` environment variable. It cannot be passed as a parameter for security reasons.

### GitHub CLI Tools

- **`gh_repo_list`** - List repositories in the envato organization using gh CLI
  - **Optional Parameters:**
    - `limit` (number): Maximum number of repositories to return

- **`gh_repo_view`** - View details of a specific repository using gh CLI
  - **Required Parameters:**
    - `repo` (string): Repository in format `'owner/repo'` (e.g., `'envato/repo-name'`)

- **`gh_pr_list`** - List pull requests using gh CLI
  - **Optional Parameters:**
    - `repo` (string): Repository in format `'owner/repo'` (optional, defaults to current repo)
    - `state` (string): Filter by state: `'open'`, `'closed'`, or `'all'`
    - `author` (string): Filter by author username
    - `limit` (number): Maximum number of PRs to return

- **`gh_pr_view`** - View details of a specific pull request using gh CLI
  - **Required Parameters:**
    - `pr_number` (number): Pull request number
  - **Optional Parameters:**
    - `repo` (string): Repository in format `'owner/repo'` (optional, defaults to current repo)

- **`gh_search_code`** - Search code using gh CLI
  - **Required Parameters:**
    - `query` (string): Search query string
  - **Optional Parameters:**
    - `repo` (string): Repository in format `'owner/repo'` to search within
    - `limit` (number): Maximum number of results to return

- **`gh_search_prs`** - Search pull requests using gh CLI
  - **Required Parameters:**
    - `query` (string): Search query string
  - **Optional Parameters:**
    - `repo` (string): Repository in format `'owner/repo'` to search within
    - `state` (string): Filter by state: `'open'`, `'closed'`, or `'all'`
    - `author` (string): Filter by author username
    - `limit` (number): Maximum number of results to return

- **`gh_search_commits`** - Search commits using gh CLI
  - **Required Parameters:**
    - `query` (string): Search query string
  - **Optional Parameters:**
    - `repo` (string): Repository in format `'owner/repo'` to search within
    - `author` (string): Filter by author username
    - `limit` (number): Maximum number of results to return

### TickTick Task Management

- **`ticktick_get_pending_tasks`** - Get pending (incomplete) tasks from TickTick
  - **Optional Parameters:**
    - `project` (string): Filter by project name
    - `priority` (string): Filter by priority: `'none'`, `'low'`, `'medium'`, or `'high'`
    - `limit` (number): Maximum number of tasks to return

- **`ticktick_get_task_summary`** - Get summary statistics of all tasks in TickTick
  - **Parameters:** None

- **`ticktick_get_all_tasks`** - Get all tasks (both complete and incomplete) from TickTick
  - **Optional Parameters:**
    - `project` (string): Filter by project name
    - `status` (string): Filter by status: `'incomplete'` or `'complete'`
    - `limit` (number): Maximum number of tasks to return

### OpenAI Integration

- **`ask_openai`** - Pass a prompt to OpenAI and wait for the response
  - **Required Parameters:**
    - `prompt` (string): The prompt/question to send to OpenAI
  - **Optional Parameters:**
    - `model` (string): The model to use (default: `'gpt-5-nano'`)

### Culture Amp (Optional)

- **`cultureamp_get_conversation`** - Get details about a Culture Amp conversation by its ID
  - **Required Parameters:**
    - `conversation_id` (string): The conversation ID (UUID format, e.g., `'0190791e-69f0-7057-939d-8bd02ca7b7b3'`)

  **Note**: Culture Amp tools require `CULTUREAMP_TOKEN` and `CULTUREAMP_REFRESH_TOKEN` environment variables. If not configured, this tool will not be available (server will start without error).

## Prerequisites

### Environment Variables

Different tools require different environment variables:

**Required:**
- `CURSOR_API_KEY` - Required for `start_cursor_agent` tool. Get your API key from [Cursor Dashboard](https://cursor.com/dashboard).
- `OPENAI_API_KEY` - Required for `ask_openai` tool. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys).

**Optional:**
- `CULTUREAMP_TOKEN` - Required for `cultureamp_get_conversation` tool (if using Culture Amp features).
- `CULTUREAMP_REFRESH_TOKEN` - Required for `cultureamp_get_conversation` tool (if using Culture Amp features).
- `CULTUREAMP_BASE_URL` - Optional, defaults to `https://envato.cultureamp.com` if not set.

### External Dependencies

- **GitHub CLI (`gh`)** - Must be installed and authenticated. Run `gh auth login` before using GitHub tools.
- **SQLite3** - Required for TickTick tools (reads from local TickTick database on macOS).

## Installation

```bash
cd local-mcp
npm install
```

## Usage

The server is configured in your MCP configuration file (`~/.cursor/mcp.json`) as:

```json
{
  "mcpServers": {
    "local-mcp": {
      "command": "node",
      "args": [
        "/Users/jonathanwilliams/Development/envato/em-automations/local-mcp/index.js"
      ]
    }
  }
}
```

## Development

To run the server directly for testing:

```bash
npm start
```

The server communicates via stdio and will be managed by your MCP client (Cursor).

## Testing

The project uses [Vitest](https://vitest.dev/) for testing. To run tests:

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run
```

Tests cover:
- `CursorAgentClient` class methods (validation, API calls, error handling)
- `LocalMCPServer` MCP handlers (tool registration, request handling)

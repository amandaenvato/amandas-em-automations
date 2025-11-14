# Local MCP Server

A custom MCP (Model Context Protocol) server that provides tools for interacting with the Cursor Agent API, GitHub CLI, OpenAI, Browser automation, and Culture Amp.

## Overview

This server provides **6 tools** organized into 5 categories:
- **Cursor Agent API** (1 tool) - Autonomous agent management
- **GitHub CLI** (1 tool) - Read-only GitHub operations via whitelisted commands
- **OpenAI** (1 tool) - Direct AI API access
- **Browser** (2 tools) - Cookie extraction and page fetching with authentication
- **Culture Amp** (1 tool) - Conversation analysis

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

- **`gh_execute`** - Execute a read-only GitHub CLI command. Only commands from the whitelist are permitted. Write operations are blocked.
  - **Required Parameters:**
    - `command` (string): The command key to execute. Must be one of the allowed read-only command keys:
      - `branch-list`, `branch-view`
      - `commit-view`
      - `issue-list`, `issue-view`
      - `pr-checks`, `pr-diff`, `pr-files`, `pr-list`, `pr-status`, `pr-view`
      - `release-download`, `release-list`, `release-view`
      - `repo-list`, `repo-view`
      - `search-code`, `search-commits`, `search-issues`, `search-prs`, `search-repos`, `search-users`
  - **Optional Parameters:**
    - `args` (array): Array of arguments to pass to the command (e.g., `['envato', '--limit', '10']`). Defaults to empty array.

  **Example Usage:**
  - List repositories: `command: 'repo-list', args: ['envato', '--limit', '10']`
  - View a PR: `command: 'pr-view', args: ['123', '--repo', 'envato/repo-name']`
  - Search code: `command: 'search-code', args: ['--query', 'functionName', '--repo', 'envato/repo-name']`

### Browser Automation

- **`extract_cookies`** - Extract cookies from a page after navigating to it and waiting for indicators that it has loaded and logged in
  - **Required Parameters:**
    - `url` (string): The URL to navigate to
    - `waitForIndicators` (array): Array of text patterns (regex) or CSS selectors (prefixed with `'css:'`) to wait for. Examples: `['JW', 'css:.home-container', 'jonathan.williams@envato.com']`. At least one indicator is required.
  - **Optional Parameters:**
    - `cookieNames` (array): Array of cookie names to extract (e.g., `['token', 'refresh-token']`). If empty, extracts all cookies.
    - `maxWaitTime` (number): Maximum time to wait for indicators in milliseconds (default: `120000`)
    - `headless` (boolean): Whether to run browser in headless mode (default: `false`)

- **`fetch_page`** - Fetch a single page, wait for indicators that it has loaded and logged in, then return the page contents (HTML and text)
  - **Required Parameters:**
    - `url` (string): The URL to fetch
    - `waitForIndicators` (array): Array of text patterns (regex) or CSS selectors (prefixed with `'css:'`) to wait for. Examples: `['Saved', 'In progress', 'css:.inbox-container', 'jonathan.williams@envato.com']`
  - **Optional Parameters:**
    - `maxWaitTime` (number): Maximum time to wait for indicators in milliseconds (default: `120000`)
    - `headless` (boolean): Whether to run browser in headless mode (default: `false`)

### OpenAI Integration

- **`ask_openai`** - Pass a prompt to OpenAI and wait for the response
  - **Required Parameters:**
    - `prompt` (string): The prompt/question to send to OpenAI
  - **Optional Parameters:**
    - `model` (string): The model to use (default: `'gpt-5'`)

### Culture Amp

- **`cultureamp_get_conversation`** - Get details about a Culture Amp conversation by its ID
  - **Required Parameters:**
    - `conversation_id` (string): The conversation ID (UUID format, e.g., `'0190791e-69f0-7057-939d-8bd02ca7b7b3'`)
    - `token` (string): Culture Amp JWT token (extracted from browser cookies via `extract_cookies`)
    - `refresh_token` (string): Culture Amp refresh token (extracted from browser cookies via `extract_cookies`)

  **Note**: Tokens must be extracted from browser cookies using the `extract_cookies` tool. Example usage:
  ```javascript
  // First, extract cookies from Culture Amp
  extract_cookies({
    url: 'https://envato.cultureamp.com/app/home',
    cookieNames: ['cultureamp.production-us.token', 'cultureamp.production-us.refresh-token'],
    waitForIndicators: ['JW']
  })

  // Then use the tokens to get conversation details
  cultureamp_get_conversation({
    conversation_id: '0190791e-69f0-7057-939d-8bd02ca7b7b3',
    token: '<extracted-token>',
    refresh_token: '<extracted-refresh-token>'
  })
  ```

## Prerequisites

### Environment Variables

Different tools require different environment variables:

**Required:**
- `CURSOR_API_KEY` - Required for `start_cursor_agent` tool. Get your API key from [Cursor Dashboard](https://cursor.com/dashboard).
- `OPENAI_API_KEY` - Required for `ask_openai` tool. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys).

**Optional:**
- `CULTUREAMP_BROWSER_DATA_DIR` - Custom directory for Culture Amp browser session data (defaults to `~/.local-mcp/cultureamp-browser-data`)
- `BROWSER_DATA_DIR` - Custom directory for general browser session data (defaults to `~/.local-mcp/browser-data`)

### External Dependencies

- **GitHub CLI (`gh`)** - Must be installed and authenticated. Run `gh auth login` before using GitHub tools.
- **Playwright** - Automatically installed via npm dependencies. Used for browser automation.

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

## Architecture

The server is built using the Model Context Protocol SDK and provides tools through a unified interface. Browser-based tools use Playwright for automation and maintain session state between requests for authenticated operations.

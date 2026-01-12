# Local MCP Server

A custom MCP (Model Context Protocol) server that provides tools for interacting with the Cursor Agent API, GitHub CLI, OpenAI, Browser automation, Culture Amp, and BambooHR.

## Overview

This server provides **14 tools** organized into 7 categories:
- **Cursor Agent API** (1 tool) - Autonomous agent management
- **GitHub CLI** (1 tool) - Read-only GitHub operations via whitelisted commands
- **OpenAI** (1 tool) - Direct AI API access
- **Browser** (2 tools) - Cookie extraction and page fetching with authentication
- **Culture Amp** (1 tool) - Conversation analysis
- **BambooHR** (3 tools) - Employee directory and information queries
- **Trello** (5 tools) - Board, list, and card manipulation

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

### BambooHR

- **`bamboohr_list_employees`** - List all employees from the BambooHR directory
  - **Optional Parameters:**
    - `limit` (number): Limit the number of results returned
    - `fields` (string): Comma-separated list of fields to return (e.g., `'firstName,lastName,workEmail,jobTitle'`)

- **`bamboohr_get_employee`** - Get a specific employee by ID from BambooHR
  - **Required Parameters:**
    - `employee_id` (string): The employee ID to retrieve
  - **Optional Parameters:**
    - `fields` (string): Comma-separated list of fields to return (e.g., `'firstName,lastName,workEmail,jobTitle,department'`)

- **`bamboohr_get_current_employee`** - Get the current employee (API key owner) from BambooHR
  - **Optional Parameters:**
    - `fields` (string): Comma-separated list of fields to return (e.g., `'firstName,lastName,workEmail,jobTitle,department'`)

  **Note**: BambooHR credentials must be configured via environment variables. See Prerequisites section below.

### Trello

- **`trello_get_board_id`** - Get Trello board ID from URL or search by name. Returns both short ID (from URL) and full ID (from API).
  - **Required Parameters:**
    - `board_identifier` (string): Board URL (e.g., `'https://trello.com/b/abc123/board-name'`), board ID, or board name to search for

- **`trello_copy_lists`** - Copy all lists and their cards from one Trello board to another
  - **Required Parameters:**
    - `source_board_id` (string): Source board ID or URL
    - `destination_board_id` (string): Destination board ID or URL

- **`trello_move_lists_by_pattern`** - Move lists matching a name pattern from source board to destination board. Lists are moved (not copied) with all their cards.
  - **Required Parameters:**
    - `source_board_id` (string): Source board ID or URL
    - `destination_board_id` (string): Destination board ID or URL
    - `pattern` (string): Name pattern to match (case-insensitive, matches start of list name)
  - **Optional Parameters:**
    - `dry_run` (boolean): If true, only preview what would be moved without making changes (default: `false`)

- **`trello_archive_lists_by_range`** - Archive lists by number range (1-based indexing)
  - **Required Parameters:**
    - `board_id` (string): Board ID or URL
    - `start_num` (number): Start list number (1-based)
    - `end_num` (number): End list number (1-based)
  - **Optional Parameters:**
    - `dry_run` (boolean): If true, only preview what would be archived without making changes (default: `false`)

- **`trello_reset_retro_board`** - Reset retrospective board by renaming lists with date and creating new empty lists
  - **Required Parameters:**
    - `source_board_id` (string): Source board ID or URL
    - `destination_board_id` (string): Destination board ID or URL for archived lists
    - `start_list_num` (number): Start list number (1-based)
    - `end_list_num` (number): End list number (1-based)
  - **Optional Parameters:**
    - `date` (string): Date to append to list names in ISO format (YYYY-MM-DD). Defaults to 2 weeks ago if not provided.

  **Note**: Trello credentials must be configured via environment variables. See Prerequisites section below.

## Prerequisites

### Environment Variables

Different tools require different environment variables:

**Required:**
- `CURSOR_API_KEY` - Required for `start_cursor_agent` tool. Get your API key from [Cursor Dashboard](https://cursor.com/dashboard).
- `OPENAI_API_KEY` - Required for `ask_openai` tool. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys).
- `BAMBOOHR_SUBDOMAIN` - Required for BambooHR tools. Your company subdomain (e.g., if your URL is `https://mycompany.bamboohr.com`, use `"mycompany"`).
- `BAMBOOHR_API_KEY` - Required for BambooHR tools. Your BambooHR API key (160-bit hexadecimal string). Get it from BambooHR Settings → API Keys.
- `TRELLO_API_KEY` - Required for Trello tools. Get your API key from [Trello App Key](https://trello.com/app-key).
- `TRELLO_API_TOKEN` - Required for Trello tools. Generate a token by visiting: `https://trello.com/1/authorize?key=<your_api_key>&name=TrelloHelper&expiration=never&response_type=token&scope=read,write` (replace `<your_api_key>` with your actual API key).

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
      ],
      "env": {
        "CURSOR_API_KEY": "<your-cursor-api-key>",
        "OPENAI_API_KEY": "<your-openai-api-key>",
        "BAMBOOHR_SUBDOMAIN": "<your-company-subdomain>",
        "BAMBOOHR_API_KEY": "<your-bamboohr-api-key>",
        "TRELLO_API_KEY": "<your-trello-api-key>",
        "TRELLO_API_TOKEN": "<your-trello-api-token>"
      }
    }
  }
}
```

**Note**: Update the path in `args` to match your repository location. Replace the placeholder values in `env` with your actual API keys and credentials.

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

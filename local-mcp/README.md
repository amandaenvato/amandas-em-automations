# Local MCP Server

A simple MCP (Model Context Protocol) server that provides tools for interacting with the Cursor Agent API.

## Features

- **start_cursor_agent**: Start a new Cursor agent using the Cursor Agent API
  - Required `repository_url`: The GitHub repository URL where the agent will work
  - Required `prompt`: Instructions or tasks for the agent to perform
  - Optional `branch_name`: The branch name where the agent will apply changes
  - Optional `agent_name`: A descriptive name for the agent
  - Optional `auto_create_pull_request`: Whether to automatically create a pull request (default: false)
  - Optional `model`: The AI model to use (default: "composer-1")

**Note**: The Cursor API key must be provided via the `CURSOR_API_KEY` environment variable. It cannot be passed as a parameter for security reasons.

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

## Future Enhancements

This server can be extended to include additional tools such as:
- Agent status checking
- Agent cancellation
- Agent result retrieval
- Additional Cursor API integrations

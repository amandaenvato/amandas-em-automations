# Local MCP Server

A simple MCP (Model Context Protocol) server that provides disk space monitoring tools.

## Features

- **get_disk_space**: Returns current disk space usage for the system
  - Optional `path` parameter to check specific directory (defaults to root "/")
  - Returns filesystem, total size, used space, available space, usage percentage, and mount point

- **get_culture_amp_notes**: Provides instructions for extracting Culture Amp 1-on-1 conversation notes
  - Required `culture_amp_id` parameter for the person's Culture Amp ID
  - Optional `base_url` parameter (defaults to "https://envato.cultureamp.com")
  - Returns step-by-step instructions for using Playwright MCP tools
  - Generates the correct Culture Amp URL with history tab
  - Provides detailed guidance on clicking "Show notes" buttons and extracting data

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

## Prerequisites for Culture Amp Tool

The `get_culture_amp_notes` tool provides instructions for using your existing Playwright MCP server. It requires:
1. **Playwright MCP server running** (already configured in your MCP setup)
2. **Brave browser connected** via the Playwright extension
3. **Logged into Culture Amp** in the connected browser tab

## Future Enhancements

This server can be extended to include additional tools such as:
- CPU usage monitoring
- Memory usage monitoring
- Network statistics
- Process monitoring
- File system operations
- Additional web scraping tools (BambooHR, etc.)

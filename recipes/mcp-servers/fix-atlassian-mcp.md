# Fix Atlassian MCP Server

This recipe diagnoses and fixes issues with the Atlassian MCP server (mcp-atlassian) which provides Jira and Confluence integration.

## When to Use

Call this recipe when:
- The Atlassian MCP server is not responding
- Jira or Confluence tools are unavailable
- The MCP preflight check fails during other recipes (e.g., prepare 1-1)

## Task

When the Atlassian MCP server is not working, execute these diagnostic and fix steps in sequence:

1. **Step 1: Check Docker Status** (see details below)
2. **Step 2: Check Container Status** (see details below)
3. **Step 3: Pull Latest Image** (see details below)
4. **Step 4: Test MCP Server Connection** (see details below)
5. **Step 5: Instruct User to Reload** (see details below)

## Step 1: Check Docker Status

### Goal
Verify that Docker Desktop is running and the Docker daemon is accessible.

### Instructions
1. Run `docker info 2>&1 | head -5` to check Docker daemon status
2. If Docker is not running:
   - **Stop the recipe**
   - Tell the user: "⚠️ Docker Desktop is not running. Please start Docker Desktop and try again."
3. If Docker is running, proceed to the next step

### Commands
```bash
docker info 2>&1 | head -5
```

### Expected Output
- Docker version and context information
- If Docker is not running, an error message about the daemon

## Step 2: Check Container Status

### Goal
Check if there's an existing mcp-atlassian container running.

### Instructions
1. Run `docker ps -a --filter "ancestor=ghcr.io/sooperset/mcp-atlassian:latest"` to list containers
2. Note if there are any existing containers (running or stopped)
3. This is informational - the MCP server containers are ephemeral (`--rm` flag) so they usually won't persist

### Commands
```bash
docker ps -a --filter "ancestor=ghcr.io/sooperset/mcp-atlassian:latest"
```

### Expected Output
- List of containers (may be empty if no containers are running)
- Empty list is normal - containers are created on-demand

## Step 3: Pull Latest Image

### Goal
Ensure the latest version of the mcp-atlassian Docker image is available.

### Instructions
1. Pull the latest image: `docker pull ghcr.io/sooperset/mcp-atlassian:latest`
2. This ensures any updates or fixes are available

### Commands
```bash
docker pull ghcr.io/sooperset/mcp-atlassian:latest
```

### Expected Output
- Image pull progress and completion
- Final message: `Status: Downloaded newer image for ghcr.io/sooperset/mcp-atlassian:latest` or `Status: Image is up to date`

## Step 4: Test MCP Server Connection

### Goal
Verify the MCP server can start and respond to initialization requests.

### Instructions
1. Test the MCP server by sending an initialization JSON-RPC message
2. Read the MCP configuration from `.cursor/mcp.json` to get the credentials
3. Run the test command with the configured environment variables

### Commands
```bash
# Test MCP server initialization
(echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}'; sleep 5) | docker run -i --rm \
  -e CONFLUENCE_URL="${CONFLUENCE_URL}" \
  -e CONFLUENCE_USERNAME="${CONFLUENCE_USERNAME}" \
  -e CONFLUENCE_API_TOKEN="${CONFLUENCE_API_TOKEN}" \
  -e JIRA_URL="${JIRA_URL}" \
  -e JIRA_USERNAME="${JIRA_USERNAME}" \
  -e JIRA_API_TOKEN="${JIRA_API_TOKEN}" \
  ghcr.io/sooperset/mcp-atlassian:latest --transport stdio 2>&1
```

### Expected Output
- FastMCP banner showing "Atlassian MCP" server name
- JSON-RPC response with `protocolVersion` and `capabilities`
- Example successful response:
  ```json
  {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05","capabilities":{...},"serverInfo":{"name":"Atlassian MCP","version":"X.X.X"}}}
  ```

### Troubleshooting
- **Authentication errors**: API tokens may have expired. User needs to generate new tokens at https://id.atlassian.com/manage-profile/security/api-tokens
- **Network errors**: Check internet connectivity
- **Container startup errors**: Try pulling the image again or check Docker logs

## Step 5: Instruct User to Reload

### Goal
Guide the user to reload Cursor to pick up the MCP server changes.

### Instructions
After successful verification, tell the user:

> ✅ **Atlassian MCP Server is working correctly.**
>
> **To complete the fix, please reload Cursor:**
> 1. Open Command Palette: `Cmd+Shift+P`
> 2. Run: `Developer: Reload Window`
>
> After reloading, the Jira and Confluence tools will be available.

### Expected Output
- User reloads Cursor window
- MCP server tools become available

## Summary

| Component | Check | Fix |
|-----------|-------|-----|
| Docker daemon | `docker info` | Start Docker Desktop |
| Docker image | `docker pull ghcr.io/sooperset/mcp-atlassian:latest` | Pull latest image |
| MCP server | Send JSON-RPC initialize | Check credentials in `.cursor/mcp.json` |
| Cursor integration | N/A | Reload window (`Cmd+Shift+P` → `Developer: Reload Window`) |

## Available Tools After Fix

Once the MCP server is running, these tools will be available:

### Jira Tools
- `jira_search` - Search issues with JQL
- `jira_get_all_projects` - List all accessible projects
- `jira_get_issue` - Get detailed issue information
- `jira_get_project` - Get project details
- `jira_get_agile_boards` - List agile boards
- `jira_get_sprints_from_board` - Get sprints from board
- `jira_get_sprint_issues` - Get issues in sprint
- `jira_get_user_profile` - Get user information
- `jira_update_issue` - Update issue fields
- `jira_add_comment` - Add comments to issues

### Confluence Tools
- `confluence_search` - Search pages using CQL or simple text
- `confluence_get_page` - Get page content by ID or title/space

## Reference

- **Repository**: https://github.com/sooperset/mcp-atlassian
- **Docker Image**: `ghcr.io/sooperset/mcp-atlassian:latest`
- **Documentation**: https://personal-1d37018d.mintlify.app/docs/
- **API Token Management**: https://id.atlassian.com/manage-profile/security/api-tokens

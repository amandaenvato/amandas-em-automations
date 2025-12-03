# Engineering Manager Automations

**AI Agent Recipes for Engineering Manager Workflows**

Instruction recipes for AI agents with MCP access to automate feedback collection, communication logging, daily checkups, and other engineering manager tasks.

## Overview

This repository contains instruction recipes for AI agents (like Claude Code, Cursor, or Goose) to automate common engineering manager workflows. The agent reads the recipe instructions, collects data from various sources (Slack, Jira, Culture Amp, Google Drive, etc.), and generates ready-to-use outputs.

**How it works:** Simply tell your agent to follow the instructions in a recipe file, and it will execute the workflow, gather necessary data, and produce formatted outputs ready for use.

## Quick Start

1. **Configure MCP Servers:**
   
   Start by copying `.cursor/mcp.example.json` to `.cursor/mcp.json`, then configure each MCP server below:
   
   **Slack MCP Server** (`slack-mcp-server`)
   - Configure Slack tokens (XOXC and XOXD), user agent, and cache paths
   - For instructions about how to configure Slack MCP Server, please follow these instructions: https://github.com/korotovsky/slack-mcp-server
   
   **Google Drive** (`gdrive`)
   - Configure OAuth credentials (CLIENT_ID, CLIENT_SECRET) and credentials directory
   - For instructions about how to configure Google Drive, please follow these instructions: https://github.com/isaacphi/mcp-gdrive
   
   **Google Calendar** (`google-calendar`)
   - Configure Google OAuth credentials
   - **Setup Steps:**
     1. **OAuth Credentials**: You can reuse the same OAuth credentials file used for Google Drive MCP. If you don't have one yet, create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/):
        - Create a project (or use existing)
        - Enable the Google Calendar API
        - Create OAuth 2.0 credentials (Desktop app type)
        - Download the credentials JSON file (typically named `gcp-oauth.keys.json`)
     2. **Update MCP Configuration**: In `.cursor/mcp.json`, set `GOOGLE_OAUTH_CREDENTIALS` to the path of your credentials file:
        ```json
        "google-calendar": {
          "command": "npx",
          "args": ["@cocal/google-calendar-mcp"],
          "env": {
            "GOOGLE_OAUTH_CREDENTIALS": "/path/to/your/gcp-oauth.keys.json"
          }
        }
        ```
     3. **Run Authentication**: Execute the authentication flow to generate tokens:
        ```bash
        GOOGLE_OAUTH_CREDENTIALS=/path/to/your/gcp-oauth.keys.json npx @cocal/google-calendar-mcp auth
        ```
        This will open a browser for OAuth authentication. Tokens will be saved to `~/.config/google-calendar-mcp/tokens.json`.
     4. **Restart Cursor**: After completing authentication, restart Cursor to load the updated MCP configuration.
   - For additional details, see: https://github.com/nspady/google-calendar-mcp
   
   **Atlassian** (`mcp-atlassian`)
   - Configure Jira and Confluence URLs, usernames, and API tokens
   - _Configuration instructions: [Add link to Atlassian MCP server documentation]_
   
   **Local MCP Server** (`local-mcp`)
   - Configure Cursor API key and OpenAI API key
   - Update the `local-mcp` command path in `mcp.json` to match your repository location (replace `/Users/jonathanwilliams/Development/envato/em-automations/local-mcp/index.js` with your path)
   - See the [Local MCP README](local-mcp/README.md) for detailed configuration instructions
   
   **PagerDuty** (`pagerduty`)
   - Configure PagerDuty OAuth credentials (CLIENT_ID and CLIENT_SECRET)
   - For instructions about how to configure PagerDuty MCP remote server, please follow these instructions: https://developer.pagerduty.com/docs/mcp-tooling-remote-server
   - Set `PAGERDUTY_CLIENT_ID` and `PAGERDUTY_CLIENT_SECRET` in the environment variables with your OAuth app credentials
   - Set `PAGERDUTY_OAUTH_SCOPES` with the space-separated scopes you selected during app registration
   - The `PAGERDUTY_OAUTH_TOKEN_URL` is pre-configured to `https://identity.pagerduty.com/oauth/token`

2. **Configure Team Information:**
   - Copy `files/recipe-config/people-info.example.md` to `files/recipe-config/people-info.md`
   - Fill in your team member information and personal details
   - This configuration is required for recipes that reference team members (Feedback Collection, Shoutouts, etc.)

3. **External MCP Dependencies:**
   Your AI agent must have access to the following external MCP servers (read/search access sufficient, write not required):

   **Communication & Collaboration:**
   - **Slack** - Team messages, communications, mentions, and saved messages

   **Documentation & Storage:**
   - **Google Drive** - Document storage, reading, and updates
   - **Atlassian Confluence** - Sprint reports and team documentation

   **Work Management:**
   - **Atlassian Jira** - Work tracking, ticket management, and completed work

   **Browser Automation:**
   - Browser automation tools (via local-mcp) for systems without APIs:
     - Culture Amp (feedback and conversation analysis)
     - BambooHR (time off request approvals)
     - Slack saved messages page

   **Calendar:**
   - **Google Calendar** - Event management and meeting facilitation tracking
   
   **Incident Management:**
   - **PagerDuty** - Incident management, on-call schedules, and alerting

## Components

### Local MCP Server

This project includes a custom [Local MCP Server](local-mcp/README.md) that provides additional tools beyond standard MCP servers:

- **Cursor Agent API** - Start autonomous Cursor agents to work on GitHub repositories
- **GitHub CLI** - Execute read-only GitHub CLI commands (repo, PR, code, commit, and issue search)
- **OpenAI** - Direct API access for additional AI capabilities
- **Browser Automation** - Extract cookies and fetch pages for systems without APIs (Culture Amp, BambooHR, etc.)
- **Culture Amp** - Conversation and feedback analysis (via browser cookie extraction)

See the [Local MCP README](local-mcp/README.md) for installation, configuration, and usage details.

### Task Manager

A simple Electron menu bar app for quickly capturing tasks. Tasks are written to `files/tasks/pending.jsonl` format. See [Task Manager README](task-manager/README.md) for setup and usage details.

## Recipes

Recipes are step-by-step instruction files that guide your AI agent through specific workflows. Each recipe contains detailed instructions for collecting data from various sources (Slack, Jira, Culture Amp, etc.) and generating formatted outputs ready for use.

**How to use:** Simply ask your agent to follow the instructions in a recipe file. For example: `Follow the instructions in "recipes/feedback/collect-info.md"` or `Please run the instructions in @daily-checkup.md`. The agent will read the recipe, execute the workflow, and produce outputs in the `files/output/` directory.

1. **Feedback Collection** - Collects team feedback from Slack, Jira, and Culture Amp for 1-on-1 sessions
2. **Communication Log** - Automates the Communication Log section of the Stakeholder Communication Plan document
3. **Sprint Report Improvement** - Enhances draft sprint reports with context and executive-friendly language
4. **Daily Checkup** - Performs comprehensive daily status checks across Slack, Jira, AWS, BambooHR, and Calendar
5. **Action Items** - Finds pending action items where you've been directly pinged or assigned in Slack and emails
6. **Shoutouts** - Identifies shoutout opportunities from recent feedback, formatted for the #shoutouts Slack channel
7. **Cursor Agent** - Identifies Jira tickets suitable for autonomous Cursor agent work and starts agents to complete them
8. **Decisions** - Extracts decisions from DSA project circle meeting notes and records them in the decision log spreadsheet
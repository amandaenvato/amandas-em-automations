# Engineering Manager Automations

**AI Agent Recipes for Engineering Manager Workflows**

Instruction recipes for AI agents with MCP access to automate feedback collection, communication logging, daily checkups, and other engineering manager tasks.

## Overview

This repository contains instruction recipes for AI agents (like Claude Code, Cursor, or Goose) to automate common engineering manager workflows. The agent reads the recipe instructions, collects data from various sources (Slack, Jira, Culture Amp, Google Drive, etc.), and generates ready-to-use outputs.

**How it works:** Simply tell your agent to follow the instructions in a recipe file, and it will execute the workflow, gather necessary data, and produce formatted outputs ready for use.

## Quick Start

1. **Configure MCP Servers:**
   - Copy `.cursor/mcp.example.json` to `.cursor/mcp.json`
   - Fill in all required credentials and tokens for each MCP server:
     - Slack tokens (XOXC and XOXD)
     - Google Drive OAuth credentials
     - Atlassian (Jira/Confluence) API tokens
     - Cursor API key, OpenAI API key (for local-mcp)
   - Update the `local-mcp` command path to match your repository location

2. **Configure Team Information:**
   - Copy `files/recipe-config/people-info.example.md` to `files/recipe-config/people-info.md`
   - Fill in your team member information and personal details
   - This configuration is required for recipes that reference team members (Feedback Collection, Shoutouts, etc.)

3. **External MCP Dependencies:**
   Your AI agent must have access to the following external MCP servers (read/search access sufficient, write not required):

   **Communication & Collaboration:**
   - **Slack** - Team messages, communications, mentions, and saved messages
   - **Gmail** - Email assignments, notifications, and document sharing

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
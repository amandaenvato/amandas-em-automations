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

### External MCP Dependencies

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

## Recipes

### 1. Feedback Collection Recipe
Automates team feedback collection from Slack, Jira, and Culture Amp for 1-on-1 sessions.

**How to Use:**
1. Ask your agent to follow the instructions in `recipes/feedback/collect-info.md`
2. Once complete, ask your agent to follow the instructions in `recipes/feedback/synthesize-feedback.md`

**What the Agent Does:**
1. Reads current feedback document from Google Drive
2. Collects team member data from Slack, Jira, and Culture Amp
3. Synthesizes comprehensive feedback entry ready to append

**Output:** `files/output/feedback-dd-mm-yyyy/`
- `current-doc.md` - Current state from Google Drive
- `slack-[name].md` - Collected Slack activity per team member
- `jira-[name].md` - Completed work per team member
- `culture-[name].md` - Culture Amp analysis per team member
- `OUTPUT.md` - **Final output**: Synthesized feedback ready to append

### 2. Communication Log Recipe
Automates the Communication Log section of the Stakeholder Communication Plan document.

**How to Use:**
- Ask your agent to follow the instructions in `recipes/communication-log/collect-communications.md`

**What the Agent Does:**
1. Reads current Communication Log from Google Drive
2. Collects Slack communications for the relevant period
3. Synthesizes new log entries ready to append

**Output:** `files/output/communication-log-dd-mm-yyyy/`
- `current-communication-log.md` - Current state from Google Drive
- `slack-communications.md` - Collected communications
- `OUTPUT.md` - **Final output**: New table rows ready to append

### 3. Sprint Report Improvement Recipe
Enhances draft sprint reports by gathering context and creating more executive-friendly versions.

**How to Use:**
- Ask your agent: `Follow the instructions in "recipes/sprint-report/improve-draft-report.md" to improve page [CONFLUENCE_PAGE_ID]`
- Example: `Follow the instructions in "recipes/sprint-report/improve-draft-report.md" to improve page 518750321`

**What the Agent Does:**
1. Reads existing draft sprint report from Confluence
2. Fetches detailed work item information from Jira
3. Collects relevant Slack discussions from the sprint period
4. Synthesizes an improved draft with better context and executive-friendly language

**Output:** `files/output/sprint-report-dd-mm-yyyy/`
- `draft-report.md` - Current draft from Confluence
- `draft-analysis.md` - Analysis of the existing draft
- `jira-work.md` - Detailed analysis of completed work items
- `slack-context.md` - Relevant Slack discussions from sprint period
- `OUTPUT.md` - **Final output**: Improved draft ready for review

### 4. Daily Checkup Recipe
Performs comprehensive daily status checks across multiple systems and provides a complete overview of pending items.

**How to Use:**
- Ask your agent: `Please run the instructions in the @daily-checkup.md`
- Or: `Follow the instructions in "recipes/daily-checkup/daily-checkup.md"`

**What the Agent Does:**
1. Checks #author-helpline Slack channel for unaddressed issues from the last 3 days
2. Searches Jira for active tickets assigned to you (excluding Done/Closed/Resolved statuses)
3. Checks for pending AWS access request notifications from the TEAM bot
4. Checks BambooHR inbox for pending time off approval requests
5. Reads tasks from `files/tasks/pending.jsonl` and organizes them by category
6. Checks Slack saved messages for action items
7. Searches Slack mentions for unaddressed action items
8. Checks additional Slack pages (AWS requests channel, Activity, DMs) for concerning messages
9. Checks Google Calendar for facilitate meetings scheduled today
10. Provides a comprehensive summary with direct links and status counts

**Output:** `files/output/daily-checkup-dd-mm-yyyy/`
- `OUTPUT.md` - **Final output**: Comprehensive daily status report
- Direct conversation summary with:
  - Author helpline status (unaddressed issues count and details)
  - Jira tickets status (active tickets organized by status)
  - AWS access request status (pending notifications requiring approval)
  - BambooHR time off request status (pending approvals)
  - Task Manager tasks summary (organized by category with priorities)
  - Saved Slack messages requiring action
  - Slack mentions and action items status
  - Calendar facilitate meetings for today
  - Overall status summary with action items and priorities

### 5. Action Items Recipe
Finds pending action items where you've been directly pinged or assigned in Slack and emails.

**How to Use:**
- Ask your agent: `Follow the instructions in "recipes/action-items/find.md" to find my pending action items`

**What the Agent Does:**
1. Searches Slack for all messages mentioning your handle (e.g., `@jdub`)
2. Searches emails for Google Docs/Sheets assignments
3. Reads specific emails to extract action details
4. Identifies channel information for correct Slack links
5. Returns formatted list of pending actions with clickable links

**Output:** Direct conversation summary in Markdown format with:
- Action titles, dates, and sources
- Clickable links to Slack channels, emails, and documents
- Specific action requirements and due dates
- Additional context for each action

### 6. Shoutouts Recipe
Identifies shoutout opportunities from recent feedback, formatted for the #shoutouts Slack channel.

**How to Use:**
- Ask your agent to follow the instructions in `recipes/shoutouts/identify-shoutouts.md`

**What the Agent Does:**
1. Reviews the most recent feedback OUTPUT file
2. Identifies 2 shoutout opportunities based on achievements and impact
3. Formats shoutouts following Leadership Essentials framework and Slack channel style

**Output:** `files/output/shoutouts-dd-mm-yyyy/`
- `OUTPUT.md` - **Final output**: 2 formatted shoutouts ready to post in the #shoutouts channel

### 7. Cursor Agent Recipe
Identifies Jira tickets suitable for autonomous Cursor agent work and starts agents to complete them.

**How to Use:**
- Ask your agent: `Follow the instructions in "recipes/cursor-agent/identify-and-start-agent.md"`

**What the Agent Does:**
1. Searches Jira backlog for tickets suitable for autonomous work
2. Analyzes tickets for clarity, risk, and scope
3. Ensures tickets are properly labeled with `ai-suitable`
4. Selects the best candidate ticket
5. Conducts planning research (Slack, Jira, Confluence, GitHub, Google Drive)
6. Updates ticket description with detailed findings and technical details
7. Starts a Cursor agent with a comprehensive prompt to complete the work

**Output:** Summary including:
- Tickets reviewed and analyzed
- Selected candidate with reasoning
- Planning findings (repository, files, context)
- Agent details (ID, status, repository)
- Next steps for monitoring and review

### 8. Decisions Recipe
Extracts decisions from DSA project circle meeting notes and records them in the decision log spreadsheet.

**How to Use:**
- Ask your agent to follow the instructions in `recipes/decisions/record-dsa-decisions.md`

**What the Agent Does:**
1. Reads DSA project circle meeting notes from Google Drive
2. Identifies decisions made in recent meetings
3. Reads the decision log spreadsheet structure
4. Formats decisions as table rows ready to be added to the spreadsheet
5. Creates a Slack message summarizing the decisions

**Output:** Direct conversation output with:
- Formatted table rows (markdown) ready to be copied into the decision log spreadsheet
- Slack message ready to post with decision summaries and link to the decision log
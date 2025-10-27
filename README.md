# Engineering Manager Automations

**AI Agent Prompts for Engineering Manager Workflows**

Instruction prompts for AI agents with MCP access to automate feedback collection and communication logging for engineering managers.

## Overview

These are instruction files for AI agents (like Claude Code, Cursor or Goose). The agent reads the instructions, collects data from Slack, Jira, Culture Amp, and Google Drive, then generates ready-to-use outputs. Just tell your agent to follow the instructions in the files.

## Prerequisites

Your AI agent must have access to the following MCP servers:
- **Slack** - Team messages and communications
- **Google Drive** - Document storage and updates
- **Atlassian** (Jira) - Work tracking and completed work
- **Playwright** - Browser automation (for Culture Amp data extraction)

## Systems

### 1. Feedback Collection System
Automates team feedback collection from Slack, Jira, and Culture Amp for 1-on-1 sessions.

**How to Use:**
1. Ask your agent to follow the instructions in `feedback/collect-info.md`
2. Once complete, ask your agent to follow the instructions in `feedback/synthesize-feedback.md`

**What the Agent Does:**
1. Reads current feedback document from Google Drive
2. Collects team member data from Slack, Jira, and Culture Amp
3. Synthesizes comprehensive feedback entry ready to append

**Output:** `feedback/dd-mm-yyyy/`
- `current-doc.md` - Current state from Google Drive
- `slack-[name].md` - Collected Slack activity per team member
- `jira-[name].md` - Completed work per team member
- `culture-[name].md` - Culture Amp analysis per team member
- `OUTPUT.md` - **Final output**: Synthesized feedback ready to append

### 2. Communication Log System
Automates the Communication Log section of the Stakeholder Communication Plan document.

**How to Use:**
- Ask your agent to follow the instructions in `communication-log/collect-communications.md`

**What the Agent Does:**
1. Reads current Communication Log from Google Drive
2. Collects Slack communications for the relevant period
3. Synthesizes new log entries ready to append

**Output:** `communication-log/dd-mm-yyyy/`
- `current-communication-log.md` - Current state from Google Drive
- `slack-communications.md` - Collected communications
- `OUTPUT.md` - **Final output**: New table rows ready to append

## Output Locations

Both systems create dated directories with collected data and final synthesized outputs:
- `feedback/dd-mm-yyyy/` - Analysis files and synthesized feedback entry
- `communication-log/dd-mm-yyyy/` - Communication analysis and log entries ready to append

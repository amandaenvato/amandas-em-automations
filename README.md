# Engineering Manager Automations

**AI Agent Recipes for Engineering Manager Workflows**

Instruction recipes for AI agents with MCP access to automate feedback collection, communication logging, and daily checkups for engineering managers.

## Overview

These are instruction recipes for AI agents (like Claude Code, Cursor or Goose). The agent reads the recipe instructions, collects data from Slack, Jira, Culture Amp, and Google Drive, then generates ready-to-use outputs. Just tell your agent to follow the instructions in the recipe files.

## Prerequisites

Your AI agent must have access to the following MCP servers:
- **Slack** - Team messages and communications
- **Google Drive** - Document storage and updates
- **Atlassian** (Jira) - Work tracking and completed work
- **Playwright** - Browser automation (for Culture Amp data extraction)

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

**Output:** `recipes/feedback/dd-mm-yyyy/`
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

**Output:** `recipes/communication-log/dd-mm-yyyy/`
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

**Output:** `recipes/sprint-report/dd-mm-yyyy/`
- `draft-analysis.md` - Analysis of the existing draft
- `jira-work.md` - Detailed analysis of completed work items
- `slack-context.md` - Relevant Slack discussions from sprint period
- `OUTPUT.md` - **Final output**: Improved draft ready for review

### 4. Daily Checkup Recipe
Performs comprehensive daily status checks for author helpline and active Jira tickets.

**How to Use:**
- Ask your agent: `Please run the instructions in the @daily-checkup.md`
- Or: `Follow the instructions in "recipes/daily-checkup/daily-checkup.md"`

**What the Agent Does:**
1. Checks #author-helpline Slack channel for unaddressed issues from the last 3 days
2. Searches Jira for active tickets assigned to you (excluding Done/Closed/Resolved statuses)
3. Provides a comprehensive summary with direct links and status counts

**Output:** Direct conversation summary with:
- Author helpline status (unaddressed issues count and details)
- Jira tickets status (active tickets organized by status)
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

## Output Locations

Most recipes create dated directories with collected data and final synthesized outputs:
- `recipes/feedback/dd-mm-yyyy/` - Analysis files and synthesized feedback entry
- `recipes/communication-log/dd-mm-yyyy/` - Communication analysis and log entries ready to append
- `recipes/sprint-report/dd-mm-yyyy/` - Draft analysis and improved sprint report

**Note:** The Daily Checkup recipe provides output directly in the conversation rather than creating files.

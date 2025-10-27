# Engineering Manager Automations

Automation tools for engineering managers to streamline feedback collection, team management, and stakeholder communications.

## Systems

### 1. Feedback Collection System
Automates team feedback collection from Slack, Jira, and Culture Amp for 1-on-1 sessions.

**Quick Start:**
- `"Follow the instructions in feedback/collect-info.md"`

**Process:**
1. Read current feedback document from Google Drive
2. Collect data from Slack, Jira, and Culture Amp
3. Synthesize comprehensive feedback entry ready to append

**Documentation:** `feedback/README.md`

### 2. Communication Log System
Automates the Communication Log section of the Stakeholder Communication Plan document.

**Quick Start:**
- `"Follow the instructions in communication-log/collect-communications.md"`

**Process:**
1. Read current Communication Log from Google Drive
2. Collect Slack communications for the relevant period
3. Synthesize new log entries ready to append

**Target Document:**
- ID: `1wrGqDXthhJ_pgHdPB_neJxbIYHT0YXRFfqk9JYOPV48`
- Document: "Stakeholder Communication Plan"
- Section: "Communication Log" table

**Output:** `communication-log/dd-mm-yyyy/`
- `current-communication-log.md` - Current state from Google Drive
- `slack-communications.md` - Collected communications
- `OUTPUT.md` - **Final output**: New table rows ready to append

**Stakeholder Groups Tracked:**
Company-Wide, Technology Heads (Ray, Nick), Domain Leadership, Mark (Direct Manager), Author Product Trio, Technology team, Author Team, Tech People People, People Team, plus project-specific stakeholder groups.

## Dependencies

Required MCP servers:
- **Slack** - Team messages and communications
- **Jira** - Work tracking and completed work
- **Google Drive** - Document storage and updates
- **Playwright** - Culture Amp data extraction (browser automation)
- **Atlassian** - Jira issue details

## Output Locations

Both systems create dated directories with collected data and final synthesized outputs:
- `feedback/dd-mm-yyyy/` - Analysis files and synthesized feedback entry
- `communication-log/dd-mm-yyyy/` - Communication analysis and log entries ready to append

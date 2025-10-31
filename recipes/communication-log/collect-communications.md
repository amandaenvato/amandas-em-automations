# Collect Communications

This prompt coordinates the **information collection** phase for automating the Communication Log section of the Stakeholder Communication Plan document.

## Task

Execute these steps in sequence:

1. **Step 1: Read Current Communication Log** (see details below)
2. **Step 2: Collect Slack Communications** (see details below)
3. **Step 3: Synthesize New Entries** (see details below)

If for whatever reason the task cannot be completed, explain the issue and ask if the user wants to retry those failures.

## Output Structure

All output goes into `communication-log/dd-mm-yyyy/`:
- `current-communication-log.md` - Current state from Google Drive
- `slack-communications.md` - Collected Slack communications
- `OUTPUT.md` - **Final output**: New table rows ready to append

## Context

### Target Document
- File ID: `1wrGqDXthhJ_pgHdPB_neJxbIYHT0YXRFfqk9JYOPV48`
- Document: "Stakeholder Communication Plan"
- Section: "Communication Log" table

### Important: Review Context First
**Before starting**:
1. **Review the em-knowledgebase** to understand:
   - Stakeholder groups and their communication patterns
   - What counts as substantive stakeholder communication
   - Communication channels and their purposes
   - Escalation patterns and risk signals
2. **Read the `recipes/people-info.md` file** to get information about the subject person (Jonathan Williams).

## Step 1: Read Current Communication Log

### Goal
Read the existing Communication Log table from Google Drive to determine:
1. What date to collect from
2. The table format to match
3. Existing entries to avoid duplicating
4. **Key channels** used for communications (to guide Slack search)

### Instructions
1. Read Google Drive document: `1wrGqDXthhJ_pgHdPB_neJxbIYHT0YXRFfqk9JYOPV48`
2. Find the "Communication Log" section
3. Extract the table and convert to markdown
4. **Identify the date of the most recent entry** - this sets your collection period
5. **Extract all unique channels** from the table to identify key communication channels
6. Save to `communication-log/dd-mm-yyyy/current-communication-log.md`

### Expected Output
Save the current Communication Log table as a markdown file. The file should contain:

```markdown
# Communication Log

| Date | Group | Item | Channel | Link | Outcome or note |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 2025-10-20 | Company-Wide | Sprint report published | #envato-delivery-and-projects | [link] | Company-wide visibility |
| 2025-10-21 | Domain Leadership | Weekly updates | Meeting | [link] | Progress shared |
| ... |
```

After the table, add a section listing all unique channels found:

```markdown
## Key Channels Identified

### Slack Channels
- #env-deployments
- #shoutouts
- #envato-delivery-and-projects
- #author-product-trio
- etc.

### Meeting Types
- Meeting
- 1-on-1
- etc.
```

**Critical Information**:
- The last entry in the table determines how far back to search for new communications
- The list of channels will guide where to search for communications

**Save as**: `communication-log/dd-mm-yyyy/current-communication-log.md`

## Step 2: Collect Slack Communications

### Goal
Search for Slack messages from the subject person across key channels and organize them by stakeholder group.

### Important: Review Context First
**Before starting**:
1. **Review the em-knowledgebase** to understand:
   - Stakeholder groups and their communication patterns
   - What counts as substantive stakeholder communication vs casual chat
   - Key channels and their purposes
   - Escalation patterns and risk signals to highlight
2. **Read the `recipes/people-info.md` file** to get information about the subject person (identified in the "Subject Person" section).

### Instructions
1. Search for messages since the most recent entry in the current Communication Log (typically last 7 days)
2. Asses messages to find stakeholder communications (skip casual chat, reactions only)
3. Organize communications by stakeholder group with full details
4. Extract date, stakeholder group, item, channel, link, and outcome for each communication

### Process
- First, read `current-communication-log.md` to identify the key channels from the "Key Channels Identified" section
- Use those channels to guide your Slack search
- Use Slack MCP tools to search for messages from the subject person (get their details from `recipes/people-info.md`)
- Search across all of Slack for most recent messages
- Additionally, search specifically in the channels identified from the Communication Log

**Focus on messages that represent stakeholder communications:**
- Sprint reports and updates
- Deployment notices
- Shoutouts and recognition
- Escalations or risks surfaced
- Decisions or decisions needed
- Project updates
- Leadership updates

**GitHub Tools for Verification:**

You can use GitHub tools to verify PR links mentioned in Slack messages:

**Available GitHub Tools:**
- `gh_pr_view` - View detailed pull request information for PRs mentioned in Slack
- `gh_search_prs` - Search for PRs if only partial information is available
- `gh_repo_view` - Verify repository information if repos are mentioned

**Use GitHub tools when:**
- Slack messages contain PR links - verify they exist and are accessible
- Deployment notices mention PRs - verify PR details match deployment information
- You need to understand technical context from PRs mentioned in communications

**For each communication record:**
1. **Date** (YYYY-MM-DD)
2. **Stakeholder Group** - match channels to stakeholder groups:
   - **Company-Wide** → Public channels with wide visibility
   - **Technology Heads** → Tech leadership channels or DMs to Ray/Nick
   - **Domain Leadership** → Domain leadership channels
   - **Mark (Direct Manager)** → Direct messages to Mark
   - **Author Product Trio** → Product trio channel or DMs
   - **Author Team** → Author domain channels
   - **Project Stakeholders** → Project-specific channels
3. **Item** (brief summary of what was communicated)
4. **Channel** (Slack channel name)
5. **Link** (permalink to message)
6. **Outcome** (any responses, reactions, or follow-up)

### Expected Output

Organize all communications by stakeholder group with full details.

**Save as**: `communication-log/dd-mm-yyyy/slack-communications.md`

### File Structure

```markdown
# Slack Communications Analysis

## Summary
- **Period**: [start date] to [end date]
- **Total Communications**: [count]
- **By Stakeholder Group**: [breakdown]

## Communications by Stakeholder Group

### Company-Wide
#### [Date] - [Brief Title]
- **Item**: Sprint report published
- **Channel**: #envato-delivery-and-projects
- **Link**: [permalink]
- **Outcome**: Company-wide visibility. Replies from [names]
- **Context**: [additional details]

### Technology Heads
[Similar format for each entry]

### [Other Groups]
[Organized by stakeholder group]

## Notable Communications
- Escalations surfaced: [list]
- Decisions made: [list]
- Risks identified: [list]
- Recognition given: [list]
```

Include enough detail to create log entries in the next phase.

## Step 3: Synthesize Communication Log Entries

### What This Does
Combines collected communication data into new table rows ready to append to the Communication Log.

### Input Files

Read from the most recent `communication-log/dd-mm-yyyy/` directory:

- `current-communication-log.md` - Existing log entries (for format and duplicate checking)
- `slack-communications.md` - Collected Slack communications

### Context

Before synthesizing, review the em-knowledgebase to understand:
- Stakeholder group categorization rules
- What counts as substantive communication vs casual chat
- Communication patterns and escalation signals
- How to format entries consistently with existing log

### Task

Create new Communication Log entries that:
1. Match the exact table format from the current document
2. Include **ONLY new** communications found since the last entry
3. Avoid duplicating existing entries
4. **CRITICAL**: The OUTPUT file should contain ONLY the table rows - NO summary, NO notes, NO explanations, just the table entries ready to append

### Output

**Save as**: `communication-log/dd-mm-yyyy/OUTPUT.md`

### Example Output Format

**CRITICAL**: The OUTPUT file should contain ONLY the table rows - nothing else. No summary, no notes, no explanations. Just the table.

```markdown
| Date | Group | Item | Channel | Link | Outcome or note |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 2025-10-28 | Company-Wide | Sprint report published | #envato-delivery-and-projects | https://envato.slack.com/archives/... | Company-wide visibility |
| 2025-10-28 | Company-Wide | Shoutout to Matt for infrastructure work | #shoutouts | https://envato.slack.com/archives/... | Recognition for ISG Fargate migration |
| 2025-10-27 | Domain Leadership | Weekly PPP updates | 1-on-1 | [link] | Progress and risks shared |
```

**Remember**: ONLY the table rows. No headers, no explanations, no context. Just the rows ready to append to the Communication Log.

### How to Synthesize

For each communication in `slack-communications.md`:

1. **Check for duplicates** - Look at `current-communication-log.md`, skip if already exists
2. **Extract the data**:
   - Date (YYYY-MM-DD)
   - Group (exact name from list below)
   - Item (concise but specific)
   - Channel (Slack channel name or meeting type)
   - Link (permalink or document link)
   - Outcome (what happened, any responses or results)
3. **Create the row** in the table format
4. **Verify** the entry doesn't already exist in the current log

### Synthesis Guidelines

#### Date Format
- Use YYYY-MM-DD format
- Ensure dates are in the correct period (since last entry)

#### Stakeholder Group
- Use exact names from the Communication Log:
  - Company-Wide
  - Technology Heads (Ray - Nick in certain circumstances)
  - Domain Leadership
  - Mark (Direct Manager)
  - Author Product Trio
  - Technology team
  - Author Team
  - Tech People People
  - People Team
  - DSA: Project Stakeholders
  - Upload Handover: Project Stakeholders
  - Salesforce Continuity: Project Stakeholders
  - Tax (Author): Project Stakeholders

#### Item Description - Examples

**Good**:
- "Sprint report published"
- "Escalation: Salesforce migration stalled"
- "Shoutout to Matt for infrastructure work"
- "Monthly product slides shared"

**Bad**:
- "Update" (too vague)
- "Sprint report for Author Domain with 3 completed stories, 2 in progress, and 1 blocked due to API dependency from Content team, plus we discussed the roadmap..." (too long)
- "posted something about the sprint" (not specific)

**Guidelines**:
- Be specific but concise
- Describe what was communicated, not the entire content
- Use consistent language with existing entries

#### Channel - Examples

**Good**: `#env-deployments`, `#shoutouts`, `Google Slides`, `1-on-1`
**Bad**: "slack message", "meeting", "document"

**Guidelines**:
- Slack: use channel name with `#`
- Documents: specify platform (`Google Slides`, `Miro`, `Confluence`)
- Meetings: specify type (`1-on-1`, `Project working group`)

#### Link - Examples

**Good**: `https://envato.slack.com/archives/C123456/p1234567890123456`
**Bad**: `[message link]`, `https://drive.google.com/...` (full URL is fine)

**Guidelines**:
- Slack: generate permalink to the specific message
- Documents: direct link to the document or slide
- Use markdown format: `[Description](url)` only if helpful

#### Outcome or Note - Examples

**Good**:
- "Company-wide visibility. Trio also notified."
- "Recognition for ISG Fargate migration. Ray acknowledged."
- "Dependency risk flagged. Bart responding."

**Bad**:
- "Done" (no context)
- "Jonathan replied and thanked everyone for the feedback on the sprint report..." (too long)

**Guidelines**:
- Summarize what happened or the result
- Note any responses, acknowledgments, decisions
- Be concise but informative

### Duplicate Prevention
- Check each new entry against existing entries in current-communication-log.md
- Skip entries that already exist (same date, group, and item)
- Note in the analysis if duplicates are found

### Verification Checklist

Before saving, verify:
- ✅ All dates in YYYY-MM-DD format
- ✅ Group names match exactly (copy from current log if unsure)
- ✅ Items are specific and concise (use examples above as guide)
- ✅ Channels follow the format examples
- ✅ Links are accessible (full URLs preferred)
- ✅ Outcomes provide context in 1-2 sentences
- ✅ No duplicates (check date, group, and item)
- ✅ Table format matches existing entries exactly
- ✅ **OUTPUT contains ONLY the table rows - no summary, no notes, no explanations**

## How It Works

### Step 1: Get Current Log
Read the existing Communication Log table to determine:
- The last entry date (this sets the collection period)
- The table format to match

### Step 2: Collect Slack Communications
Search for messages from the last entry date. Default period: **7 days**.

Channels to search:
- Company-wide: `#env-deployments`, `#shoutouts`, `#envato-delivery-and-projects`
- Leadership: `#extended-technology-leadership-team`, `#cust-account-mgmt-and-author-leadership`
- Product: `#author-product-trio`
- Team: `#author-domain`
- Projects: `#author-compliance-management-dsa`, `#proj-upload-handover`, `#tmp-salesforce-workato-poc`

### Step 3: Synthesize New Entries
Combine collected data into new Communication Log table rows matching the exact format from the document.

## Stakeholder Groups to Track

- Company-Wide
- Technology Heads (Ray, Nick)
- Domain Leadership
- Mark (Direct Manager)
- Author Product Trio
- Technology team
- Author Team
- Tech People People
- People Team
- DSA: Project Stakeholders
- Upload Handover: Project Stakeholders
- Salesforce Continuity: Project Stakeholders
- Tax (Author): Project Stakeholders

## Types of Communications to Capture

- Sprint reports and updates
- Deployment notices
- Shoutouts and recognition
- Escalations or risks surfaced
- Decisions or decisions needed
- Project updates to stakeholders
- Leadership updates
- Monthly product slides
- Team communications

## Timeline

Default collection period: Period of time since the last Communication Log entry.

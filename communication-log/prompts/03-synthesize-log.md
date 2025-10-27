# Synthesize Communication Log Entries

## What This Does
Combines collected communication data into new table rows ready to append to the Communication Log.

## Input Files

Read from the most recent `communication-log/dd-mm-yyyy/` directory:

- `current-communication-log.md` - Existing log entries (for format and duplicate checking)
- `slack-communications.md` - Collected Slack communications

## Task

Create new Communication Log entries that:
1. Match the exact table format from the current document
2. Include **ONLY new** communications found since the last entry
3. Avoid duplicating existing entries
4. **CRITICAL**: The OUTPUT file should contain ONLY the table rows - NO summary, NO notes, NO explanations, just the table entries ready to append

## Output

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

## How to Synthesize

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

## Synthesis Guidelines

### Date Format
- Use YYYY-MM-DD format
- Ensure dates are in the correct period (since last entry)

### Stakeholder Group
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

### Item Description - Examples

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

### Channel - Examples

**Good**: `#env-deployments`, `#shoutouts`, `Google Slides`, `1-on-1`
**Bad**: "slack message", "meeting", "document"

**Guidelines**:
- Slack: use channel name with `#`
- Documents: specify platform (`Google Slides`, `Miro`, `Confluence`)
- Meetings: specify type (`1-on-1`, `Project working group`)

### Link - Examples

**Good**: `https://envato.slack.com/archives/C123456/p1234567890123456`
**Bad**: `[message link]`, `https://drive.google.com/...` (full URL is fine)

**Guidelines**:
- Slack: generate permalink to the specific message
- Documents: direct link to the document or slide
- Use markdown format: `[Description](url)` only if helpful

### Outcome or Note - Examples

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

## Duplicate Prevention
- Check each new entry against existing entries in current-communication-log.md
- Skip entries that already exist (same date, group, and item)
- Note in the analysis if duplicates are found

## Verification Checklist

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


# Read Current Communication Log

## Goal
Read the existing Communication Log table from Google Drive to determine:
1. What date to collect from
2. The table format to match
3. Existing entries to avoid duplicating

## Task
1. Read Google Drive document: `1wrGqDXthhJ_pgHdPB_neJxbIYHT0YXRFfqk9JYOPV48`
2. Find the "Communication Log" section
3. Extract the table and convert to markdown
4. **Identify the date of the most recent entry** - this sets your collection period
5. Save to `communication-log/dd-mm-yyyy/current-communication-log.md`

## Instructions
Use the MCP Google Drive tools to read the document, extract the table, convert to markdown format, and identify the most recent entry date.

## Expected Output
Save the current Communication Log table as a markdown file. The file should contain:

```markdown
# Communication Log

| Date | Group | Item | Channel | Link | Outcome or note |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 2025-10-20 | Company-Wide | Sprint report published | #envato-delivery-and-projects | [link] | Company-wide visibility |
| 2025-10-21 | Domain Leadership | Weekly updates | Meeting | [link] | Progress shared |
| ... |
```

**Critical Information**: The last entry in the table determines how far back to search for new communications. Remember this date for the Slack collection phase.

**Save as**: `communication-log/dd-mm-yyyy/current-communication-log.md`


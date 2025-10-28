# Read Current Communication Log

## Goal
Read the existing Communication Log table from Google Drive to determine:
1. What date to collect from
2. The table format to match
3. Existing entries to avoid duplicating
4. **Key channels** used for communications (to guide Slack search)

## Task
1. Read Google Drive document: `1wrGqDXthhJ_pgHdPB_neJxbIYHT0YXRFfqk9JYOPV48`
2. Find the "Communication Log" section
3. Extract the table and convert to markdown
4. **Identify the date of the most recent entry** - this sets your collection period
5. **Extract all unique channels** from the table to identify key communication channels
6. Save to `communication-log/dd-mm-yyyy/current-communication-log.md`

## Instructions
Use the MCP Google Drive tools to read the document, extract the table, convert to markdown format, identify the most recent entry date, and extract all unique channels from the Channel column.

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


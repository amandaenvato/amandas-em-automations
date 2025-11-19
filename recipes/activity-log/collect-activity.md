# Collect Activity Report

This recipe collects Slack, Jira, and Confluence activity for a team member over a specified time period (default: last week) and generates a comprehensive activity report.

## Task

Execute these steps in sequence:

1. **Step 1: Get Team Member Information** (see details below)
2. **Step 2: Collect Slack Activity** (see details below)
3. **Step 3: Collect Jira Activity** (see details below)
4. **Step 4: Collect Confluence Activity** (see details below)
5. **Step 5: Generate Activity Report** (see details below)
6. **Step 6: Copy Report to Google Drive** (see details below)

If for whatever reason the task cannot be completed, explain the issue and ask if the user wants to retry those failures.

## Output Structure

All output goes into `files/output/{firstname}-activity-dd-mm-yyyy/` (where dd-mm-yyyy is the generation date):
- `{firstname}-activity-dd-mm-yyyy.md` - Comprehensive activity report with Slack, Jira, and Confluence activity (where dd-mm-yyyy is the end date of the activity period)

The report is also copied to the team member's Activity folder in Google Drive:
- `{Local Google Drive Path}/{firstname}/Activity/{firstname}-activity-dd-mm-yyyy.md` (where dd-mm-yyyy is the end date of the activity period)

**Note**: The directory name uses the generation date (when the report is created), while the filename uses the end date of the activity period being reported on.

## Context

### Important: Review Context First
**Before starting**:
1. **Read the `files/recipe-config/people-info.md` file** to get information about:
   - Team member details including:
     - Email addresses
     - Slack IDs
     - Jira account IDs
     - Local Google Drive Paths
2. **Determine the date range**:
   - Default: Last 7 days (ending yesterday)
   - User may specify a different date range
   - Format dates as YYYY-MM-DD for queries

## Step 1: Get Team Member Information

### Goal
Retrieve all necessary information about the team member from the configuration file.

### Instructions
1. Read `files/recipe-config/people-info.md`
2. Locate the team member's section
3. Extract:
   - Email address
   - Slack ID (format: UXXXXXXXXX)
   - Slack display name (e.g., @Alex Johnson)
   - Jira account_id (format: 123456:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
   - Local Google Drive Path

### Expected Output
- Team member's information ready for use in subsequent steps

## Step 2: Collect Slack Activity

### Goal
Collect all Slack messages from the team member during the specified time period.

### Instructions
1. Use Slack MCP `conversations_search_messages` tool
2. Search for messages using the team member's Slack ID or display name
3. Filter by date range using `filter_date_after` and `filter_date_before`
4. Collect messages from all channels where the team member is active

### Process
- **Search Method**: Use `search_query` parameter with the team member's name or Slack ID
  - Example: `search_query: "Alex Johnson"` or `search_query: "from:U1234567890"`
- **Date Range**: Use `filter_date_after` and `filter_date_before` parameters
  - Format: `YYYY-MM-DD` (e.g., `2025-11-13`)
  - Default: Last 7 days ending yesterday
- **Limit**: Set `limit` to 100 for comprehensive coverage
- **Alternative**: If direct user search doesn't work, search by name and filter results by UserID

### Analysis
For each message, note:
- Date and time (convert to Melbourne time)
- Channel name
- Message content
- Thread context (if applicable)
- Key themes and topics
- Collaborations with other team members

### Expected Output
- List of Slack messages with dates, channels, and content
- Summary of key activities by date
- Identification of main themes and collaborations

## Step 3: Collect Jira Activity

### Goal
Collect all Jira issues updated or assigned to the team member during the specified time period.

### Instructions
1. Use the Atlassian MCP `jira_search` tool via Python script wrapper
2. Search for issues assigned to the team member
3. Filter by update date within the specified range
4. Retrieve issue details including status, priority, and description

### Process
- **JQL Query Format**: 
  ```
  assignee = "{account_id}" AND updated >= "{start_date}" AND updated < "{end_date}"
  ```
  - Example: `assignee = "123456:abcdef12-3456-7890-abcd-ef1234567890" AND updated >= "2025-11-13" AND updated < "2025-11-20"`
- **Access Method**: Use Python script wrapper (`files/scratch/call_atlassian_mcp.py`)
  ```bash
  python3 files/scratch/call_atlassian_mcp.py 'assignee = "{account_id}" AND updated >= "{start_date}" AND updated < "{end_date}"'
  ```
- **Fields to Retrieve**: summary, assignee, issuetype, description, labels, created, priority, status, reporter, updated

### Analysis
For each issue, extract:
- Issue key (e.g., PROJ-123)
- Summary
- Status
- Priority
- Issue Type
- Created date
- Updated date (convert to Melbourne time)
- Reporter
- Description/context
- Link to issue
- Related PRs (if mentioned in Slack or description)

### Expected Output
- List of Jira issues updated during the period
- Issue details including status, priority, and context
- Links to related pull requests or documentation

## Step 4: Collect Confluence Activity

### Goal
Collect all Confluence pages created or modified by the team member during the specified time period.

### Instructions
1. Use the Atlassian MCP `confluence_search` tool via Python script wrapper
2. Search for pages created or modified by the team member
3. Filter by last modified date within the specified range

### Process
- **CQL Query Format**: 
  ```
  contributor = "{email}" AND lastModified >= "{start_date}"
  ```
  - Example: `contributor = "alex.johnson@example.com" AND lastModified >= "2025-11-13"`
- **Access Method**: Use Python script wrapper (`files/scratch/call_confluence_search.py`)
  ```bash
  python3 files/scratch/call_confluence_search.py 'contributor = "{email}" AND lastModified >= "{start_date}"'
  ```
- **Alternative Queries**: If the above doesn't work, try:
  - `creator = "{email}" OR lastModified = "{email}" AND lastModified >= "{start_date}"`

### Analysis
For each page found, extract:
- Page title
- Space key
- Created date
- Last modified date (convert to Melbourne time)
- Link to page

### Expected Output
- List of Confluence pages created or modified (if any)
- Note if no activity found during the period

## Step 5: Generate Activity Report

### Goal
Create a comprehensive markdown report combining all collected activity.

### Instructions
1. Create output directory: `files/output/{firstname}-activity-dd-mm-yyyy/`
2. Generate markdown file: `{firstname}-activity-dd-mm-yyyy.md` (where dd-mm-yyyy is the end date of the activity period)
3. Structure the report with the following sections:
   - Title and date range
   - Executive Summary
   - Slack Activity (with message count, key channels, activities by date, themes)
   - Jira Activity (with issues updated, details, and links)
   - Confluence Activity (with pages created/modified or note if none)
   - Pull Requests (if any mentioned)
   - Key Collaborations
   - Notable Achievements
   - Areas of Focus
   - Data Sources

### Report Format
```markdown
# {Full Name} - Activity Report ({start_date} - {end_date})
**Date Range**: {start_date} - {end_date}  
**Generated**: {generation_date}

---

## Executive Summary

{2-4 bullet points summarizing main activities}

---

## Slack Activity

### Message Count
- **Total messages**: {count} messages identified
- **Key channels**: 
  - `#channel-1`
  - `#channel-2`

### Key Activities by Date

#### {Date}
- **Topic**: Description
  - Details
  - Messages in `#channel`

### Key Themes from Slack
1. **Theme 1**: Description
2. **Theme 2**: Description

---

## Jira Activity

### Issues Updated in Last Week ({date_range})

**Search Query**: `{jql_query}`

**Results**: Found {count} issues updated:

1. **{ISSUE-KEY}** - {Summary}
   - **Status**: {Status}
   - **Updated**: {Date} at {Time} (Melbourne time)
   - **Created**: {Date}
   - **Priority**: {Priority}
   - **Issue Type**: {Type}
   - **Reporter**: {Name}
   - **Link**: {URL}
   - **Context**: {Description}

---

## Confluence Activity

### Pages Created or Updated in Last Week ({date_range})

**Search Query**: `{cql_query}`

**Results**: {List of pages or "No Confluence pages were found..."}

---

## Pull Requests

{List of PRs with links}

---

## Key Collaborations

- **{Name}** ({Slack ID}): {Description}

---

## Notable Achievements

1. ✅ {Achievement}

---

## Areas of Focus

1. **{Area}**: {Description}

---

## Data Sources

- **Slack**: Retrieved via Slack MCP `conversations_search_messages` tool
- **Jira**: Retrieved via Atlassian MCP `jira_search` tool (accessed via Python script wrapper)
- **Confluence**: Retrieved via Atlassian MCP `confluence_search` tool (accessed via Python script wrapper)

---

*Report generated: {date}*  
*All times converted to Melbourne time (AEDT/AEST)*
```

### Expected Output
- File: `files/output/{firstname}-activity-dd-mm-yyyy/{firstname}-activity-dd-mm-yyyy.md` (where dd-mm-yyyy is the end date of the activity period)
- Contains: Comprehensive activity report with all collected data

## Step 6: Copy Report to Google Drive

### Goal
Copy the generated report to the team member's Activity folder in their Google Drive directory.

### Instructions
1. Get the team member's Local Google Drive Path from `people-info.md`
2. Create the Activity folder if it doesn't exist: `{Local Google Drive Path}/{firstname}/Activity/`
3. Copy the report file to that location

### Process
```bash
# Create Activity folder if needed
mkdir -p "{Local Google Drive Path}/{firstname}/Activity"

# Copy the report
cp "files/output/{firstname}-activity-dd-mm-yyyy/{firstname}-activity-dd-mm-yyyy.md" \
   "{Local Google Drive Path}/{firstname}/Activity/{firstname}-activity-dd-mm-yyyy.md"
```

### Expected Output
- Report file copied to Google Drive Activity folder
- File accessible via Google Drive sync

## Date Range Calculation

### Default Behavior
- **End Date**: Yesterday (day before today)
- **Start Date**: 7 days before end date
- **Format**: YYYY-MM-DD for queries, DD-MM-YYYY for directory names

### Example
- Today: November 20, 2025
- End Date: November 19, 2025
- Start Date: November 13, 2025
- Date Range: November 13-19, 2025
- Directory: `alex-activity-20-11-2025` (uses generation date)
- Filename: `alex-activity-19-11-2025.md` (uses end date of activity period)

### Custom Date Ranges
If user specifies a different date range:
- Use the provided dates
- Directory name uses generation date (dd-mm-yyyy)
- Filename uses end date of activity period (dd-mm-yyyy)
- Update report title and date range sections

## Time Zone Handling

**Important**: All times in the report must be expressed in Melbourne time (AEDT/AEST).

- Convert UTC times from Slack/Jira/Confluence to Melbourne time
- Note timezone in report footer: "All times converted to Melbourne time (AEDT/AEST)"
- Melbourne uses:
  - AEDT (Australian Eastern Daylight Time) during daylight saving (October-April): UTC+11
  - AEST (Australian Eastern Standard Time) during standard time (April-October): UTC+10

## Troubleshooting

### Slack Search Issues
- If user search by display name fails, try searching by Slack ID
- If direct user filter doesn't work, search by name and filter results manually
- Use `search_query` parameter with team member's name

### Jira Search Issues
- Ensure account_id format is correct (includes the prefix like "123456:")
- Verify date format is YYYY-MM-DD
- Check that Python script wrapper has correct credentials

### Confluence Search Issues
- Try different CQL query formats if initial search fails
- Some queries may need to be simplified
- Note if no results found (this is valid - not everyone creates Confluence pages)

### Google Drive Copy Issues
- Verify Local Google Drive Path exists and is correct
- Ensure Google Drive sync is active
- Check folder permissions

## Example Usage

To collect activity for Alex Johnson:
1. Read `people-info.md` to get Alex's details
2. Search Slack for messages from Alex (U1234567890) from Nov 13-19, 2025
3. Search Jira for issues assigned to Alex's account_id updated in that period
4. Search Confluence for pages created/modified by alex.johnson@example.com
5. Generate report: `files/output/alex-activity-20-11-2025/alex-activity-19-11-2025.md` (end date: Nov 19, 2025)
6. Copy to: `{Alex's Local Google Drive Path}/Alex/Activity/alex-activity-19-11-2025.md`

## Notes

- The report focuses on activity during the specified time period
- Not all team members will have activity in all three sources (Slack, Jira, Confluence)
- It's normal for some team members to have no Confluence activity
- The report should highlight both technical work and collaboration/communication
- Include context about why work was done (from Slack discussions or Jira descriptions)


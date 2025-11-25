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
- **Channel link** (e.g., `https://envato.slack.com/archives/C1234567890`)
- **Message link** (e.g., `https://envato.slack.com/archives/C1234567890/p1234567890123456`)
- Message content
- Thread context (if applicable)
- Thread link (if in a thread)
- Key themes and topics
- Collaborations with other team members
- **Document links** (if any Google Drive, Confluence, or other documents are mentioned in messages)

### Expected Output
- List of Slack messages with dates, channels, content, and **all relevant links**
- Summary of key activities by date with channel links
- Identification of main themes and collaborations
- Links to all referenced documents and resources

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
- **Jira issue link** (e.g., `https://envato.atlassian.net/browse/PROJ-123`) - **REQUIRED**
- **Related PRs** (if mentioned in Slack or description) - include GitHub PR links
- **Document links** (if any Google Drive, Confluence, or other documents are referenced in description)
- **Slack thread links** (if any Slack discussions are referenced in description)

### Expected Output
- List of Jira issues updated during the period
- Issue details including status, priority, and context
- **Jira issue links for every issue**
- Links to related pull requests, documentation, and referenced resources

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
- **Confluence page link** (e.g., `https://envato.atlassian.net/wiki/spaces/SPACE/pages/123456789/Page+Title`) - **REQUIRED**
- Page ID (for constructing links if not provided)

### Expected Output
- List of Confluence pages created or modified (if any) with **links to each page**
- Note if no activity found during the period

## Step 5: Generate Activity Report

### Goal
Create a comprehensive markdown report combining all collected activity.

### ⚠️ IMPORTANT: Formatting Requirements Checklist
**Before generating the report, ensure you follow these formatting requirements:**

- ✅ **Jira Activity**: NO bullet points or numbered lists - use line breaks with double spaces, two blank lines between issues
- ✅ **Pull Requests**: NO bullet points or numbered lists - use line breaks with double spaces, two blank lines between PRs  
- ✅ **Key Themes from Slack**: NO numbered lists - use bullet points for details, two blank lines between themes
- ✅ **Notable Achievements**: NO numbered lists - use ✅ emoji + bullet points for details, two blank lines between achievements
- ✅ **Key Collaborations**: NO bullet points for names - use bullet points only for details, two blank lines between collaborations
- ✅ **Areas of Focus**: NO numbered lists - use bullet points for details, two blank lines between areas

**See detailed formatting requirements below (items 4-9).**

### Instructions
1. Create output directory: `files/output/{firstname}-activity-dd-mm-yyyy/`
2. Generate markdown file: `{firstname}-activity-dd-mm-yyyy.md` (where dd-mm-yyyy is the end date of the activity period)
3. Structure the report with the following sections:
   - Title and date range
   - Executive Summary
   - Slack Activity (with message count, key channels with links, activities by date with message links, themes)
   - Jira Activity (with issues updated, details, and **Jira issue links for every issue**)
   - Confluence Activity (with pages created/modified with **Confluence page links** or note if none)
   - Pull Requests (if any mentioned, with GitHub PR links)
   - Key Collaborations (with links to Slack conversations and related issues)
   - Notable Achievements (with links to related resources)
   - Areas of Focus (with links to related resources)
   - Data Sources
4. **Jira Activity Formatting Requirements**:
   - **Do NOT use bullet points or numbered lists** for Jira issues
   - Format each issue as a paragraph with fields separated by line breaks (use double space + newline at end of each field line)
   - Use **two blank lines** between each issue for clear visual separation
   - Format Related Resources as comma-separated inline links (not a bullet list)
   - Each field should be on its own line with a double space at the end to create a line break in HTML
5. **Pull Requests Formatting Requirements**:
   - **Do NOT use bullet points or numbered lists** for Pull Requests
   - Format each PR as a paragraph with fields separated by line breaks (use double space + newline at end of each field line)
   - Use **two blank lines** between each PR for clear visual separation
   - Each field should be on its own line with a double space at the end to create a line break in HTML
6. **Key Themes from Slack Formatting Requirements**:
   - **Do NOT use numbered lists** for themes (use bullet points for details within each theme)
   - Format each theme with a bold title followed by bullet points for details
   - Use **two blank lines** between each theme for clear visual separation
   - Format Related Resources as comma-separated inline links within a bullet point
   - Each theme should start with a bold title, followed by bullet points for details
7. **Notable Achievements Formatting Requirements**:
   - **Do NOT use numbered lists** for achievements (use bullet points for details within each achievement)
   - Format each achievement with ✅ emoji and bold title followed by bullet points for details
   - Use **two blank lines** between each achievement for clear visual separation
   - Format Related Resources as comma-separated inline links within a bullet point
   - Each achievement should start with ✅ emoji and bold title, followed by bullet points for details
8. **Key Collaborations Formatting Requirements**:
   - **Do NOT use bullet points** for collaborator names (use bullet points only for details/links within each collaboration)
   - Format each collaboration with bold name followed by bullet points for details
   - Use **two blank lines** between each collaboration for clear visual separation
   - Each collaboration should start with bold name and description, followed by bullet points for links/details
9. **Areas of Focus Formatting Requirements**:
   - **Do NOT use numbered lists** for areas (use bullet points for details within each area)
   - Format each area with bold title followed by bullet points for details
   - Use **two blank lines** between each area for clear visual separation
   - Format Related Resources as comma-separated inline links within a bullet point
   - Each area should start with a bold title, followed by bullet points for details
10. **CRITICAL**: Ensure every piece of information includes its reference link:
   - Every Slack message/channel → Slack link
   - Every Jira issue → Jira link
   - Every Confluence page → Confluence link
   - Every PR mentioned → GitHub PR link
   - Every document referenced → Document link (Google Drive, Confluence, etc.)

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
  - [`#channel-1`](https://envato.slack.com/archives/C1234567890)
  - [`#channel-2`](https://envato.slack.com/archives/C9876543210)

### Key Activities by Date

#### {Date}
- **Topic**: Description
  - Details
  - Messages in [`#channel`](https://envato.slack.com/archives/C1234567890)
  - [Link to specific message/thread](https://envato.slack.com/archives/C1234567890/p1234567890123456)

### Key Themes from Slack

**Theme 1**: Description  
- Details about theme 1
- Additional details
- **Related Resources**: [Related Slack thread](https://envato.slack.com/archives/C1234567890/p1234567890123456), [Related Jira issue](https://envato.atlassian.net/browse/PROJ-123)


**Theme 2**: Description  
- Details about theme 2
- **Related Resources**: [Related Slack thread](https://envato.slack.com/archives/C1234567890/p1234567890123456)

### Referenced Documents
- [Document Name](https://docs.google.com/document/d/...) - Referenced in [`#channel`](https://envato.slack.com/archives/C1234567890)

---

## Jira Activity

### Issues Updated in Last Week ({date_range})

**Search Query**: `{jql_query}`

**Results**: Found {count} issues updated:

**[{ISSUE-KEY}]({JIRA_URL})** - {Summary}  
**Status**: {Status}  
**Updated**: {Date} at {Time} (Melbourne time)  
**Created**: {Date}  
**Priority**: {Priority}  
**Issue Type**: {Type}  
**Reporter**: {Name}  
**Jira Link**: [{ISSUE-KEY} on Jira]({JIRA_URL})  
**Context**: {Description}  
**Related Resources**: [Related PR](https://github.com/org/repo/pull/123), [Related Document](https://docs.google.com/document/d/...), [Related Slack Thread](https://envato.slack.com/archives/C1234567890/p1234567890123456) (if applicable)


**[{ISSUE-KEY}]({JIRA_URL})** - {Summary}  
**Status**: {Status}  
**Updated**: {Date} at {Time} (Melbourne time)  
**Created**: {Date}  
**Priority**: {Priority}  
**Issue Type**: {Type}  
**Reporter**: {Name}  
**Jira Link**: [{ISSUE-KEY} on Jira]({JIRA_URL})  
**Context**: {Description}  
**Related Resources**: [Related PR](https://github.com/org/repo/pull/123), [Related Document](https://docs.google.com/document/d/...), [Related Slack Thread](https://envato.slack.com/archives/C1234567890/p1234567890123456) (if applicable)

---

## Confluence Activity

### Pages Created or Updated in Last Week ({date_range})

**Search Query**: `{cql_query}`

**Results**: 
- [{Page Title}]({CONFLUENCE_URL}) - {Space Key}
  - **Created**: {Date}
  - **Last Modified**: {Date} at {Time} (Melbourne time)
  - **Confluence Link**: [{Page Title}]({CONFLUENCE_URL})

OR

**Results**: No Confluence pages were found during this period.

---

## Pull Requests

**[PR Title](https://github.com/org/repo/pull/123)** - {Description}  
**Repository**: {repo-name}  
**Status**: {merged/open/closed}  
**Related Jira**: [{ISSUE-KEY}]({JIRA_URL}) (if applicable)  
**GitHub Link**: [PR #123](https://github.com/org/repo/pull/123)


**[PR Title](https://github.com/org/repo/pull/456)** - {Description}  
**Repository**: {repo-name}  
**Status**: {merged/open/closed}  
**Related Jira**: [{ISSUE-KEY}]({JIRA_URL}) (if applicable)  
**GitHub Link**: [PR #456](https://github.com/org/repo/pull/456)

---

## Key Collaborations

**{Name}** ({Slack ID}): {Description}  
- [Slack conversation in `#channel`](https://envato.slack.com/archives/C1234567890/p1234567890123456)
- [Related Jira issue]({JIRA_URL}) (if applicable)


**{Name}** ({Slack ID}): {Description}  
- [Slack conversation in `#channel`](https://envato.slack.com/archives/C1234567890/p1234567890123456)

---

## Notable Achievements

✅ **{Achievement}**: {Description}  
- **Related Resources**: [Related Jira issue]({JIRA_URL}), [Related PR](https://github.com/org/repo/pull/123), [Related Slack discussion](https://envato.slack.com/archives/C1234567890/p1234567890123456) (if applicable)


✅ **{Achievement}**: {Description}  
- [Related link]({URL})
- **Related Resources**: [Related Jira issue]({JIRA_URL}) (if applicable)

---

## Areas of Focus

**{Area}**: {Description}  
- **Related Resources**: [Related Jira issues]({JIRA_URL}), [Related Slack channels](https://envato.slack.com/archives/C1234567890), [Related documentation]({CONFLUENCE_URL}) (if applicable)


**{Area}**: {Description}  
- [Related link]({URL})
- Additional details

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
- **IMPORTANT**: Every piece of information must include its reference link:
  - Slack channels and messages must have Slack links
  - Jira issues must have Jira links
  - Confluence pages must have Confluence links
  - Pull requests must have GitHub links
  - Documents mentioned must have their respective links (Google Drive, Confluence, etc.)
- Links should be formatted as markdown links: `[Display Text](URL)`
- When extracting information from Slack messages, look for URLs to documents, Jira issues, PRs, etc., and include them in the report
- **⚠️ CRITICAL FORMATTING REQUIREMENTS**: When generating reports, you MUST follow the formatting requirements in Step 5:
  - **Jira Activity**: NO bullet points or numbered lists - use line breaks with double spaces, two blank lines between issues
  - **Pull Requests**: NO bullet points or numbered lists - use line breaks with double spaces, two blank lines between PRs
  - **Key Themes**: NO numbered lists - use bullet points for details, two blank lines between themes
  - **Notable Achievements**: NO numbered lists - use ✅ emoji + bullet points, two blank lines between achievements
  - **Key Collaborations**: NO bullet points for names - use bullet points only for details, two blank lines between collaborations
  - **Areas of Focus**: NO numbered lists - use bullet points for details, two blank lines between areas
- **Reference Format**: See `files/output/peter-activity-25-11-2025/peter-activity-24-11-2025.md` for a correctly formatted example


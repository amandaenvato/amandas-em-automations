# Get Callouts - Retrieve Callout Tickets for Reports

Get all callout tickets assigned to Amanda's reports from the last month. **The date range is automatically calculated based on when you run this recipe** - it will always fetch callouts from the previous calendar month.

## Before Starting

**Read the `files/recipe-config/people-info.md` file** to get Jira account IDs for all team members (Amanda's reports).

## Output Structure

1. **Create a dated directory**: `files/output/callouts-dd-mm-yyyy/` (e.g., `files/output/callouts-04-12-2025/`)
2. **Create OUTPUT.md** in that directory with the callout tickets summary
3. **Respond in conversation** with a summary of the callouts found

## Instructions

### Step 1: Determine Date Range (Automatic)

**The script automatically calculates the date range dynamically** based on when you run it. No manual date entry is needed.

The script `files/scratch/get_callout_tickets.py` automatically:
- Gets the current date when executed
- Calculates the first day of the previous month (start date)
- Uses the first day of the current month as the end date (exclusive)
- Format dates as: `YYYY-MM-DD`

**Examples**:
- If you run it on **December 4, 2025**: Gets November 2025 (`2025-11-01` to `2025-12-01` exclusive)
- If you run it on **January 15, 2026**: Gets December 2025 (`2025-12-01` to `2026-01-01` exclusive)
- If you run it on **March 1, 2026**: Gets February 2026 (`2026-02-01` to `2026-03-01` exclusive)

**Important**: The date range is always calculated dynamically - you don't need to specify dates when running this recipe.

### Step 2: Build JQL Query

Construct a JQL query with the following criteria:
- Project: `INC`
- Summary contains: `"Callout"` (using `summary ~ "Callout"`)
- Assignee: One of Amanda's reports (from `people-info.md`)
- Created date: Within the last month date range

**JQL Query Format**:
```
project = INC AND summary ~ "Callout" AND assignee in ("accountId1", "accountId2", ...) AND created >= "YYYY-MM-01" AND created < "YYYY-MM-DD"
```

**Note**: The end date should be the first day of the current month (exclusive) to capture all of last month.

### Step 3: Execute Query

Use the Jira API to search for tickets:

**Method**: Use the Python script `files/scratch/get_callout_tickets.py` which:
- Automatically calculates the last month date range
- Reads account IDs from `files/recipe-config/people-info.md` (hardcoded in script)
- Builds and executes the JQL query
- Retrieves full ticket details including:
   - Issue key
   - Summary
   - Status
   - Priority
   - Issue type
   - Assignee
   - Created date
   - Labels
   - Jira URL

### Step 4: Analyze Results

For each callout ticket found, extract:
- **Issue key** (e.g., INC-244)
- **Summary** (e.g., "Callout for peter.lynch@envato.com")
- **Assignee** (team member name)
- **Status** (Done, In Progress, etc.)
- **Created date** (convert to Melbourne time if needed)
- **Priority** (if set)
- **Jira issue link** (e.g., `https://envato.atlassian.net/browse/INC-244`)

### Step 5: Generate Summary

Create a summary organized by:
1. **Total count** of callouts
2. **Breakdown by assignee** (how many callouts each person received)
3. **Breakdown by status** (how many Done, In Progress, etc.)
4. **List of all tickets** with key details

## Expected Output Format

### OUTPUT.md Structure

```markdown
# Callouts Report - [Month Year]

**Date Range**: [Start Date] to [End Date]
**Total Callouts**: [Number]

## Summary by Assignee

- **[Name]**: [Count] callouts
  - [List of ticket keys]

## Summary by Status

- **Done**: [Count]
- **In Progress**: [Count]
- **Other**: [Count]

## All Callouts

### [Ticket Key]: [Summary]
- **Assignee**: [Name]
- **Status**: [Status]
- **Created**: [Date]
- **Priority**: [Priority]
- **Link**: [Jira URL]

[Repeat for each ticket]
```

## Example Output

```markdown
# Callouts Report - November 2025

**Date Range**: 2025-11-01 to 2025-12-01 (exclusive)
**Total Callouts**: 10

## Summary by Assignee

- **Victor Chang**: 4 callouts
  - INC-234, INC-233, INC-232, INC-229
- **Mimmi Sandstroem**: 3 callouts
  - INC-235, INC-231, INC-228
- **Mark Zhou**: 2 callouts
  - INC-219, INC-218
- **Peter Lynch**: 1 callout
  - INC-244

## Summary by Status

- **Done**: 10

## All Callouts

### INC-244: Callout for peter.lynch@envato.com
- **Assignee**: Peter Lynch
- **Status**: Done
- **Created**: 2025-11-24T07:19:10.701+1100
- **Priority**: None
- **Link**: https://envato.atlassian.net/browse/INC-244

[... continue for all tickets]
```

## Notes

- **Dynamic Date Range**: The date range is automatically calculated based on when you run the recipe. It always fetches data from the previous calendar month, regardless of when you execute it.
- The query uses `summary ~ "Callout"` to find tickets with "Callout" in the summary field
- All dates should be displayed in Melbourne time (AEDT/AEST)
- The recipe automatically includes all team members from `people-info.md` as potential assignees
- No manual date input required - just run the recipe and it will automatically get the correct month's data


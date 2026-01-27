# Get Initiative Delivery Update

This recipe gathers comprehensive delivery and results information for specified initiatives from Jira and Confluence.

## Goal

When the user asks for initiative updates (e.g., "Bring information about the delivery of these initiatives: [initiative names]"), gather comprehensive information about:
- Delivery status and completion dates
- Coverage metrics and volumes
- Key achievements and milestones
- Results and impact
- Technical details

## Task

Execute these steps in sequence:

1. **Step 1: Search for Initiatives** (see details below)
2. **Step 2: Gather Initiative Details** (see details below)
3. **Step 3: Gather Related Tickets** (see details below)
4. **Step 4: Gather Status Pages** (see details below)
5. **Step 5: Compile Summary** (see details below)

## Step 1: Search for Initiatives

### Goal
Find the Jira initiative tickets and related information for the initiatives mentioned by the user.

### Instructions
1. Search Jira for initiatives by name/title using JQL queries
2. Search Confluence for related status pages and documentation
3. Look for initiative keys (e.g., IN-383, IN-401) and epic keys

### Expected Output
- Initiative ticket keys
- Related epic keys
- Status page URLs
- Related documentation pages

## Step 2: Gather Initiative Details

### Goal
Retrieve comprehensive details from the initiative tickets.

### Instructions
1. Use `mcp_amandas-em-automations-mcp-atlassian_jira_get_issue` to get full details for each initiative
2. Extract:
   - Status (Done, In Progress, etc.)
   - Resolution date
   - Description
   - Comments (especially status updates)
   - Related tickets/epics
   - Assignee and reporter
   - Custom fields (forecast dates, etc.)

### Expected Output
- Full initiative details including status, dates, and comments

## Step 3: Gather Related Tickets

### Goal
Find and retrieve details for related implementation tickets (tasks, epics, etc.).

### Instructions
1. From initiative details, identify related tickets (epics, tasks, etc.)
2. Search for tickets linked to the initiative
3. Retrieve details for key implementation tickets
4. Look for tickets with status updates, completion dates, and metrics

### Expected Output
- Related ticket details
- Implementation status
- Completion dates
- Key metrics and numbers

## Step 4: Gather Status Pages

### Goal
Retrieve program status pages and completed uplifts tracking pages that contain delivery information.

### Instructions
1. Search Confluence for:
   - Program status/high-level status pages
   - Completed uplifts pages
   - Initiative-specific documentation
2. Read key pages that contain delivery status and metrics
3. Extract:
   - Completion dates
   - Coverage percentages
   - Volume metrics
   - Status updates

### Expected Output
- Status page content with delivery information
- Completion dates and metrics

## Step 5: Compile Summary

### Goal
Create a comprehensive summary document with delivery and results information.

### Instructions
1. Create a markdown document in `files/scratch/initiative-delivery-update.md`
2. Structure the summary with:
   - Initiative name and key
   - Status (Completed/In Progress/etc.)
   - Delivery summary with dates
   - Coverage metrics and volumes
   - Key achievements
   - Results and impact
   - Technical details
3. For each initiative, include:
   - Completion dates
   - Coverage percentages/volumes
   - Backfill process details (if applicable)
   - System integration status
   - Customer impact
4. Provide a response in conversation format summarizing the key points

### Output Format

```markdown
# Initiative Delivery Update

## [Initiative Name]

**Initiative:** [IN-XXX]
**Status:** ✅ [Status]
**Completion Date:** [Date]

### Delivery Summary
- Coverage: [X% or X items]
- Completion date: [Date]
- Process details: [Details]

### Key Achievements
- [Achievement 1]
- [Achievement 2]

### Results & Impact
- [Impact point 1]
- [Impact point 2]
```

### Expected Output
- Summary document in `files/scratch/initiative-delivery-update.md`
- Conversational response with key highlights

## Important Notes

- **Source Attribution:** When including specific numbers or metrics, note the source (e.g., "from Jira comment on [date]" or "from status page")
- **Date Format:** Use Melbourne time (AEDT/AEST) for all dates
- **Accuracy:** Verify completion dates and metrics from multiple sources when possible
- **Status Updates:** Pay special attention to recent comments in Jira tickets as they often contain the most current status
- **Completed Uplifts Page:** Check the "Completed uplifts" Confluence page for official completion dates

## Example Queries

- "Bring information about the delivery of these initiatives: [Initiative Name 1], [Initiative Name 2]"
- "Get me an update on [IN-XXX] delivery"
- "What's the status of [Initiative Name]?"

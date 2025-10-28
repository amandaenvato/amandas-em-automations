# Improve Draft Sprint Report

This prompt orchestrates gathering context about a draft sprint report and rewriting it to be more comprehensive and executive-friendly.

## Task

**Step 0: Extract the Confluence page ID**
- The user will say something like "improve page 518750321" or "follow the instructions to improve page 518750321"
- Extract the numeric page ID (e.g., `518750321`)
- This is the Confluence page ID for the draft sprint report to improve

**Step 1: Read the draft from Confluence**
- Use `confluence_get_page` with the extracted page ID
- Convert to markdown format
- Save as `sprint-report/dd-mm-yyyy/draft-report.md`

**Steps 2-5: Execute the workflow**

2. Execute `prompts/01-analyze-draft.md` to understand the draft and extract sprint details
3. Execute `prompts/02-get-sprint-work.md` to fetch all completed work items from Jira
4. Execute `prompts/03-collect-slack-context.md` to gather Slack discussions from relevant channels
5. Execute `prompts/04-synthesize-improved-report.md` to generate a better draft

## Error Handling

If for whatever reason the task cannot be completed, explain the issue and ask if the user wants to retry.

**Common issues:**
- **Missing sprint**: If sprint dates don't match, check board ID and date ranges
- **No issues in sprint**: Verify sprint ID and board
- **Slack search fails**: Check channel names have `#` prefix
- **Confluence read fails**: Verify page ID and permissions
- **Jira API fails**: Check if it's a rate limit issue, may need to retry

If you hit an error:
1. Explain what went wrong
2. Show what information you were able to gather
3. Suggest what to check or try next

## Output Structure

All output goes into `sprint-report/dd-mm-yyyy/`:
- `draft-report.md` - Current draft from Confluence
- `jira-work.md` - Detailed analysis of completed work items
- `slack-context.md` - Relevant Slack discussions from the sprint period
- `OUTPUT.md` - **Final output**: Improved draft ready for review

## Context

### Input
- **Confluence page ID**: Extracted from user's instruction (e.g., "improve page 518750321")
- **Target document**: Draft sprint report page from Confluence
- **Location**: Typically in the AU Confluence space under Sprint Reports

### Sprint Period
- Sprint dates are extracted from the draft report
- Default: Review last 2 weeks of activity from sprint end date

## How It Works

### Step 1: Analyze Draft
Read the existing draft to extract:
- Sprint dates (start and end)
- Sprint goal
- Work items mentioned (by ticket number)
- Current structure and content

### Step 2: Get Sprint Work Details
For each work item mentioned in the draft:
- Fetch all sprint issues from Jira to get overview
- For major initiatives/epics: Fetch full details from Jira with changelog expansion
- For simpler items: Use basic sprint issue data (summary, status, dates)
- Analyze what was actually accomplished vs planned
- Note any blockers or context
- **Efficiency tip**: Only do detailed lookups for ~10-15 most important issues, not every single one

### Step 3: Collect Slack Context
Search Slack for discussions during the sprint period in:
- `#author-domain` - Team coordination
- `#author-helpline` - Support and escalations
- `#author-compliance-management-dsa` - Project-specific context
- Any other channels mentioned in work items

Look for:
- Deployment announcements
- Blockers and escalations
- Team discussions about work items
- Decisions made
- Context about challenges

### Step 4: Synthesize Improved Report
Create a new draft that:
- Better matches the template format (clear sections: Wins, Challenges, Additional Notes, Metrics)
- Is more comprehensible for executives (clear, concise, business-focused)
- Groups wins by initiative/project
- Provides better context for each work item
- Uses more accessible language
- Highlights business value and impact

## Key Principles

### For Wins Section
- Group by initiative or project area
- Focus on business impact and outcomes
- Make technical achievements accessible to non-technical readers
- Highlight customer/author benefits
- Keep descriptions concise but meaningful
- Only include major accomplishments (5-7 items max)

### For Challenges Section
- Be honest but constructive
- Focus on risks and mitigation strategies
- Avoid making the team look incompetent
- Use language that demonstrates thoughtfulness
- Limit to 2-3 challenges that actually mattered
- Explain how challenges were mitigated (don't just list problems)

### For Additional Notes Section
- Provide forward-looking context
- Reference upcoming work
- Note dependencies or coordination needs
- Mention monitoring or follow-up actions
- Only include if there's something noteworthy
- 3-4 bullets max


# Generate Jira Analysis Reports

## Goal
Generate individual Jira work activity reports for each team member.

## Important: Read People Information First
**Before starting**, read the `people-info.md` file in the workspace root to get Jira account IDs and email addresses for all team members.

## Task
For each team member:
1. Search Jira for recently completed work items assigned to them in the ATH project
2. Analyze their work patterns, completion rate, and technical contributions
3. Note: Only look at work completed since their last feedback entry
4. Generate insights about their work quality, velocity, and focus areas

## Instructions
- Use Jira MCP tools to search for issues
- For each person, use their account_id in the search query
- Search query format: `project = ATH AND assignee in (accountId) AND status = Done AND resolved >= "-7d"`
- Example for Matt: `project = ATH AND assignee in (557058:78cd7ea5-4b4e-47b9-9090-be983700bf1e) AND status = Done AND resolved >= "-7d"`
- For each person, analyze:
  - Types of work completed (features, bugs, improvements)
  - Work complexity and impact
  - Velocity and consistency
  - Technical approach and solutions
  - Any patterns in their work

## Output Format
For each person, create `feedback/dd-mm-yyyy/jira-{firstname}.md` with:
- Summary of completed work
- List of key issues/tickets completed
- Analysis of work patterns
- Technical contributions
- Work quality and consistency
- Notable achievements

## Expected Files
- `feedback/dd-mm-yyyy/jira-matt.md`
- `feedback/dd-mm-yyyy/jira-ana.md`
- `feedback/dd-mm-yyyy/jira-ai.md`
- `feedback/dd-mm-yyyy/jira-niko.md`
- `feedback/dd-mm-yyyy/jira-shannon.md`


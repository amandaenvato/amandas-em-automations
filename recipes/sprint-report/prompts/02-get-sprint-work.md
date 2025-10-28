# Get Sprint Work Details from Jira

## Goal
Fetch ALL work items from the sprint (committed at start, completed, and not completed) to understand scope, delivery, and scope evolution.

## Important: Read People Information First
**Before starting**, read the `recipes/people-info.md` file to get information about the Author team.

## Task

1. Get the sprint details from Jira using sprint dates from `draft-analysis.md`
2. Fetch ALL issues in the sprint (completed and not completed)
3. Analyze scope evolution: what was committed to, what was added, what wasn't finished
4. For each work item, understand context, value, and status

## Instructions

### Step 1: Find the Sprint
- Use `jira_get_sprints_from_board` for Author Team Board (Board ID: 130)
- Find the sprint that matches the dates from `draft-analysis.md`
- Get the sprint_id

### Step 2: Get All Sprint Issues
- Use `jira_get_sprint_issues` with the sprint_id and no JQL filter
- Get ALL issues regardless of status
- This will return completed, in progress, and unstarted work
- **Alternative**: If `jira_get_sprint_issues` fails, use `jira_get_board_issues` with the board ID (130) and a JQL filter like `sprint = [sprint_id]`

**Important**: Get all issues including:
- Completed issues (to understand what was delivered)
- In Progress issues (to understand work in flight)
- To Do issues (to understand what wasn't started or was planned but not committed)
- All issue types (Stories, Tasks, Bugs, Epics)

This gives you the full picture of scope evolution and completion.

### Step 3: Analyze Each Issue
For each ticket returned, you have two options:

**Option A: Batch Analysis (Recommended)**
- Get basic info from sprint issues call (summary, status, created date, assignee)
- Use this to categorize work (committed vs added, completed vs not)
- Only get detailed `jira_get_issue` with expand=changelog for:
  - Issues that represent major initiatives or epic items
  - Issues with unclear status or context needed
  - Issues with interesting scope evolution patterns
- Most issues can be analyzed from basic sprint issues data

**Option B: Detailed Analysis (Thorough but slow)**
- Get full details using `jira_get_issue` with expand=changelog for every issue
- Note when issue was created vs sprint start date (committed at start or added later)
- Identify current status (Done, In Progress, To Do)
- Read descriptions and comments for context

**For scope evolution analysis, you need at minimum**:
- Issue creation date (to determine committed vs added during sprint)
- Current status (to determine completed vs not)
- Summary (to understand what work was done)
- Priority (to understand importance)

### Step 4: Scope Analysis
Categorize and analyze:
- **Work committed at sprint start**: Issues created before or on sprint start date
- **Work added during sprint**: Issues added after sprint start date
- **Work completed**: Issues with status "Done"
- **Work not completed**: Issues not "Done" at end of sprint

Look for patterns:
- Was scope creep gradual or sudden?
- How much work was added vs initially committed?
- What percentage of committed work was completed?
- What categories of work weren't finished (bugs, features, tasks)?
- What drove the scope changes? (new requirements, discoveries, dependencies)

## Output Format

Save as `sprint-report/dd-mm-yyyy/jira-work.md`:

```markdown
# Sprint Work Analysis - [dates]

## Sprint Overview
- **Sprint ID**: [id]
- **Sprint Goal**: [from sprint goal field]
- **Total Issues**: [count]
- **Completed**: [count] ([X%])
- **Not Completed**: [count] ([X%])
- **Committed at Start**: [count]
- **Added During Sprint**: [count]

## Scope Evolution Summary

### Committed Work (at Sprint Start)
[List key planned work with ticket numbers]
- ATH-XXXX: [Summary] - Priority work
- ATH-YYYY: [Summary] - Priority work

### Added During Sprint (Scope Expansion)
[List work added after sprint started]
- ATH-ZZZZ: [Summary] - Why it was added
- ATH-AAAA: [Summary] - Why it was added

**Scope Evolution Narrative**: [2-3 sentences explaining why scope changed and how]

## Completed Work Details

### [Group by initiative if possible]
[For each completed issue]
- **ATH-1512: [Summary]**
  - **Type**: Story/Bug/Task
  - **Committed at start?**: Yes/No
  - **Assignee**: [name]
  - **Business Value**: [why this matters]
  - **Technical Achievement**: [what was built]
  - **Related Items**: [links]
  - **Completed Date**: [date]

## Incomplete Work Details

### [Group by status or reason]
[For each incomplete issue]
- **ATH-XXXX: [Summary]**
  - **Type**: Story/Bug/Task
  - **Committed at start?**: Yes/No
  - **Current Status**: In Progress / To Do / Blocked
  - **Assignee**: [name]
  - **Why Not Done**: [blocker, dependency, priority change, etc.]
  - **Impact**: [what's delayed or risk created]
```

## Expected Output

- File: `sprint-report/dd-mm-yyyy/jira-work.md`
- ALL work items from sprint (completed and not completed)
- Clear scope evolution narrative
- Business value for completed work
- Analysis of incomplete work and reasons
- Patterns in scope changes
- Completion rate and delivery metrics

## Performance Notes

- You don't need to fetch full details for every single issue
- Focus detailed analysis on:
  - Epic/ticket items that represent major initiatives
  - Items with complex status changes or scope evolution
  - Items that are incomplete and need explanation
- Most issues can be categorized and analyzed from the basic sprint issues list
- This approach reduces API calls from 50+ down to 10-15 detailed lookups

## What to Include in Analysis

**DO analyze in detail:**
- Epic work items (major initiatives)
- Items with high priority or critical labels
- Items that are incomplete (to explain why)
- Items that represent platform/infrastructure changes
- Items with unclear status or blockers

**DO NOT analyze in detail:**
- Low priority tasks
- Documentation-only changes
- Small configuration tweaks
- Minor bug fixes
- Tasks that are routine maintenance

**For the final report:**
- Only "major" work should appear in wins section (see 04-synthesize prompt for criteria)
- Filter out minor tasks even if they were important to complete
- Focus on work that has business impact


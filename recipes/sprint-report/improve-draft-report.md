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

2. **Step 2: Analyze Draft** (see details below)
3. **Step 3: Get Sprint Work Details** (see details below)
4. **Step 4: Collect Slack Context** (see details below)
5. **Step 5: Synthesize Improved Report** (see details below)

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
- `draft-analysis.md` - Analysis of the draft
- `jira-work.md` - Detailed analysis of completed work items
- `slack-context.md` - Relevant Slack discussions from the sprint period
- `OUTPUT.md` - **Final output**: Improved draft ready for review

## Before Starting

**Review the em-knowledgebase** to understand:
- Current initiatives and epics in progress
- Key systems and their importance
- What types of work should be highlighted
- Compliance and SOX considerations
- Domain context and business priorities

This context will help you identify what work matters most and how to present it effectively to executives.

## Context

### Input
- **Confluence page ID**: Extracted from user's instruction (e.g., "improve page 518750321")
- **Target document**: Draft sprint report page from Confluence
- **Location**: Typically in the AU Confluence space under Sprint Reports

### Sprint Period
- Sprint dates are extracted from the draft report
- Default: Review last 2 weeks of activity from sprint end date

## Step 2: Analyze Draft Sprint Report

### Goal
Read an existing draft sprint report from Confluence and extract key information.

### Context

Before analyzing, review the em-knowledgebase to understand:
- Current initiatives and epics that should be highlighted
- Key systems and their business importance
- What types of work demonstrate value to executives
- Compliance and SOX considerations that may need emphasis

### Task

Read the draft sprint report and identify:

1. **Sprint Details**
   - Sprint start date
   - Sprint end date
   - Sprint goal (if mentioned)

2. **Work Items Referenced**
   - All Jira ticket numbers mentioned (e.g., ATH-1512)
   - Epic or initiative names
   - Project areas or focus

3. **Current Structure**
   - Sections present (Wins, Challenges, Additional Notes, Metrics)
   - Tone and level of detail
   - What works well and what needs improvement

4. **Missing Context**
   - Areas that seem vague or unclear
   - Technical jargon that needs simplification
   - Business value not clearly articulated

### Instructions

- Read the draft page from Confluence
- Parse the content for the information above
- Identify patterns in how work is organized
- Note any inconsistencies or areas that could be clearer

**GitHub Tools for Verification:**

You can use GitHub tools to verify PR links mentioned in the draft:

**Available GitHub Tools:**
- `gh_pr_view` - View detailed pull request information to verify PR links
- `gh_search_prs` - Search for PRs related to Jira tickets mentioned
- `gh_repo_view` - Verify repository information if mentioned

**Use GitHub tools when:**
- PR links are mentioned in the draft - verify they exist and are accessible
- Jira tickets reference PRs - verify the PR details match ticket descriptions
- You need to understand implementation details referenced in the draft

### Output Format

Save as `sprint-report/dd-mm-yyyy/draft-analysis.md`:

```markdown
# Draft Sprint Report Analysis

## Sprint Details
- **Start Date**: YYYY-MM-DD
- **End Date**: YYYY-MM-DD
- **Sprint Goal**: [goal text]

## Work Items Referenced
- [List all ticket numbers mentioned]
  - ATH-1512
  - ATH-1524
  - ...

## Current Structure
- Sections present: [Wins, Challenges, Additional Notes, Metrics]
- Tone: [technical, business-focused, etc.]
- Length: [brief or verbose]

## Key Issues to Address
- [List specific issues with the current draft]
  - Too technical
  - Lacks business value
  - Poor grouping
  - etc.

## Work Items to Investigate Further
[List work items that need deeper context to understand their business value]
```

### Expected Output

- File: `sprint-report/dd-mm-yyyy/draft-analysis.md`
- Contains sprint dates and all ticket numbers
- Identifies improvement opportunities
- Notes missing context or unclear areas

## Step 3: Get Sprint Work Details

### Context

Before gathering work details, review the em-knowledgebase to understand:
- Which initiatives and epics are currently active and their importance
- Key systems and their business impact
- What types of work should be prioritized for detailed analysis
- Compliance and SOX work that requires special attention from Jira

### Goal
Fetch ALL work items from the sprint (committed at start, completed, and not completed) to understand scope, delivery, and scope evolution.

### Important: Read People Information First
**Before starting**, read the `recipes-config/people-info.md` file to get information about the Author team.

### Task

1. Get the sprint details from Jira using sprint dates from `draft-analysis.md`
2. Fetch ALL issues in the sprint (completed and not completed)
3. Analyze scope evolution: what was committed to, what was added, what wasn't finished
4. For each work item, understand context, value, and status

### Instructions

#### Step 1: Find the Sprint
- Use `jira_get_sprints_from_board` for Author Team Board (Board ID: 130)
- Find the sprint that matches the dates from `draft-analysis.md`
- Get the sprint_id

#### Step 2: Get All Sprint Issues
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

#### Step 2.5: Use GitHub Tools to Find Related PRs

You can use GitHub tools to find pull requests related to Jira tickets:

**Available GitHub Tools:**
- `gh_search_prs` - Search for PRs that mention Jira ticket numbers (e.g., "ATH-1512")
- `gh_search_commits` - Search commits that reference ticket numbers
- `gh_pr_view` - View detailed PR information when PRs are found
- `gh_repo_list` - List repositories to identify relevant repos for Author domain

**Use GitHub tools to:**
- Find PRs related to completed tickets (for technical details and implementation context)
- Verify PR links mentioned in ticket descriptions
- Understand implementation details for completed work
- Search for PRs by author if ticket assignee matches GitHub username

**Example searches:**
- `gh_search_prs` with query "ATH-1512" to find PRs mentioning that ticket
- `gh_search_commits` with query "ATH-1512" to find commits related to the ticket

#### Step 3: Analyze Each Issue
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

#### Step 4: Scope Analysis
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

### Output Format

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

### Expected Output

- File: `sprint-report/dd-mm-yyyy/jira-work.md`
- ALL work items from sprint (completed and not completed)
- Clear scope evolution narrative
- Business value for completed work
- Analysis of incomplete work and reasons
- Patterns in scope changes
- Completion rate and delivery metrics

### Performance Notes

- You don't need to fetch full details for every single issue
- Focus detailed analysis on:
  - Epic/ticket items that represent major initiatives
  - Items with complex status changes or scope evolution
  - Items that are incomplete and need explanation
- Most issues can be categorized and analyzed from the basic sprint issues list
- This approach reduces API calls from 50+ down to 10-15 detailed lookups

### What to Include in Analysis

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
- Only "major" work should appear in wins section (see Step 5 for criteria)
- Filter out minor tasks even if they were important to complete
- Focus on work that has business impact

## Step 4: Collect Slack Context for Sprint

### Goal
Gather relevant Slack discussions from the sprint period to add context to the report.

### Important: Read Sprint Details First
**Before starting**, read `draft-analysis.md` to get the sprint dates.

### Task

Search for Slack activity during the sprint period (from sprint start to end date):

1. Search key channels for activity
2. Look for relevant discussions about sprint work
3. Collect context about:
   - Deployments and releases
   - Blockers and escalations
   - Team discussions about work
   - Decisions made
   - Shoutouts or achievements

### Channels to Search

#### Required Channels
- `#author-domain` - Main team channel
- `#author-helpline` - Support and escalations
- `#author-compliance-management-dsa` - Project context

#### Additional Channels (if relevant)
- `#env-deployments` - Deployment notices
- `#author-product-trio` - Product coordination
- `#author-verification-compliance` - If related to verification work
- Other channels mentioned in work items

### What to Look For

#### Deployment Announcements
- "Deployed [feature] to production"
- "Rolling out [change] to [audience]"
- Links to relevant PRs or deployments

#### Escalations and Blockers
- Issues that came up during the sprint
- How they were resolved
- Team coordination efforts

#### Team Discussions
- Technical discussions about implementation
- Decisions about approaches
- Problem-solving conversations

#### Achievements
- Shoutouts or recognition
- Positive feedback from stakeholders
- Success stories

### Search Strategy

1. Use `conversations_search_messages` to search each channel
   - Format channel names with `#` prefix (e.g., `#author-domain`)
   - Use `filter_date_after` and `filter_date_before` to set exact date range
   - Start with limit=100 to get comprehensive results
2. Filter by date range (sprint start to end date)
3. Look for messages from Author team members
4. Focus on messages related to work items mentioned in the draft

**Important Notes**:
- Channel names MUST include `#` prefix
- Date format should be YYYY-MM-DD
- Search results return message objects with timestamp, user info, and text
- Use the results to understand: deployments, blockers, discussions, achievements

**GitHub Tools for Verification:**

You can use GitHub tools to verify PR links mentioned in Slack messages:

**Available GitHub Tools:**
- `gh_pr_view` - View detailed pull request information for PRs mentioned in Slack
- `gh_search_prs` - Search for PRs if only partial information is available
- `gh_repo_view` - Verify repository information if repos are mentioned

**Use GitHub tools when:**
- Slack messages contain PR links - verify they exist and are accessible
- Deployment notices mention PRs - verify PR details match deployment information
- You need to understand technical context from PRs mentioned in discussions

### Output Format

Save as `sprint-report/dd-mm-yyyy/slack-context.md`:

```markdown
# Slack Context for Sprint [dates]

## Summary
- **Total relevant messages found**: [count]
- **Key themes**: [themes]

## Deployments and Releases
### [Date] - [Feature/Change]
- **Channel**: #[channel]
- **Message**: [quote or summary]
- **Link**: [permalink]
- **Context**: [why this matters for the sprint report]

## Escalations and Blockers
### [Date] - [Issue]
- **Channel**: #[channel]
- **Problem**: [summary]
- **Resolution**: [how it was handled]
- **Link**: [permalink]

## Team Discussions
### [Date] - [Topic]
- **Channel**: #[channel]
- **Discussion**: [summary of key points]
- **Decision/Outcome**: [what was decided]
- **Link**: [permalink]

## Achievements and Recognition
### [Date] - [Achievement]
- **Channel**: #[channel]
- **Message**: [quote or summary]
- **Link**: [permalink]
```

### Expected Output

- File: `sprint-report/dd-mm-yyyy/slack-context.md`
- Relevant Slack messages from the sprint period
- Organized by theme (deployments, blockers, discussions, achievements)
- Provides context for improving the draft report

## Step 5: Synthesize Improved Sprint Report

### Goal
Generate an improved draft sprint report that is more comprehensive, executive-friendly, and follows the template format.

### Input Files

Read all files from the most recent date-stamped directory in `sprint-report/`:

- `draft-analysis.md` - Analysis of current draft
- `jira-work.md` - Detailed work items from Jira
- `slack-context.md` - Slack discussions and context

**GitHub Tools for Verification:**

You can use GitHub tools to verify PR links before including them in the report:

**Available GitHub Tools:**
- `gh_pr_view` - Verify PR details and ensure links are correct
- `gh_search_prs` - Find PRs if ticket numbers are mentioned but PR links are missing
- `gh_repo_view` - Verify repository information

**Use GitHub tools when:**
- You need to verify PR links mentioned in Jira tickets or Slack discussions
- You want to include PR links in the report - verify they're correct and accessible
- You need technical context from PRs to better describe work items

### Context

Before synthesizing, review the em-knowledgebase to understand:
- How to identify which work items are "major" vs routine
- Current initiatives and their business importance
- How to group work logically (by initiative/project)
- What types of work demonstrate value to executives
- Compliance and SOX considerations that may need emphasis

### Task

Generate a new sprint report that:

1. **Follows the Template Format**
   - Clear header with dates
   - Sprint Goal section
   - Wins section (grouped by initiative/project)
   - Challenges and risks section
   - Additional Notes section
   - Metrics placeholders

2. **Is Executive-Friendly and Accessible**
   - Focuses on business value and outcomes
   - Uses simple, direct language (as if audience has English as second language)
   - Short sentences. Simple words. Direct statements.
   - No jargon unless necessary. Explain technical terms when used.
   - Highlights impact on authors, support, compliance
   - Clear and concise

3. **Provides Better Context**
   - Groups wins logically by project area
   - Explains why work matters (business context)
   - Shows relationships between work items
   - Highlights key accomplishments

4. **Improves Clarity**
   - Clear section headers
   - Consistent formatting
   - Well-organized content
   - Appropriate level of detail

## Writing Principles

**CRITICAL: Write for non-native English speakers**
- Use short sentences (10-15 words max)
- Use simple words (avoid: mitigate, leverage, facilitate, optimize)
- Say things directly ("We did X" not "X was facilitated")
- Use active voice ("System blocks author" not "Author is blocked")
- Avoid contractions ("do not" not "don't" in formal sections)
- Explain acronyms first time (Author Platform (AP))
- Use plain present tense ("We lock" not "System enables locking")
- Be literal, not metaphorical ("System stops author" not "System prevents author journey")

**CRITICAL: Be brief**
- Only include major accomplishments (omit minor tasks)
- Maximum 5-7 wins (not every ticket)
- Maximum 2-3 challenges
- Maximum 3-4 additional notes
- Metrics: 1 sentence per metric
- Goal explanation: 1-2 sentences only

**What counts as "major"?**
- Epic/in Initiative work (completing a feature or workflow)
- Production issues fixed (that affected customers)
- Security or compliance improvements
- Infrastructure changes that impact the team
- Do NOT include: small bug fixes, minor tweaks, routine maintenance, configuration changes, documentation-only updates

### Wins Section
- **Group by initiative**: Usually "Initiative Name" and "Platform Reliability & KTLO" or similar
- **Use bullet points**: One bullet per major accomplishment
- **Keep brief**: 1-2 short sentences per bullet
- **Lead with what was done**: "Fixed X" or "Delivered Y"
- **Include Jira links**: Use format `[text](https://envato.atlassian.net/browse/TICKET-ID)`
- **Reference multiple tickets**: Use "See:" followed by comma-separated links when appropriate
- **Avoid detailed explanations**: Just the essential outcome
- **Use simple bullet format**: `*` markdown bullets with headings for sections

**Example from real sprint report:**
```markdown
Wins:
-----

### Discrepancy Management Initiative
* [Discrepancy Management pipeline delivered](https://envato.atlassian.net/browse/ATH-1512). System detects name mismatches and locks authors to ID verification. Pipeline works across three systems. See: [ATH-1512](https://envato.atlassian.net/browse/ATH-1512), [ATH-1508](https://envato.atlassian.net/browse/ATH-1508), [ATH-1513](https://envato.atlassian.net/browse/ATH-1513)
* [Added explanatory messaging for authors](https://envato.atlassian.net/browse/ATH-1521). Authors now understand why they need to redo ID verification. Reduces support tickets.

### Platform Reliability & KTLO
* [Fixed offboarding process](https://envato.atlassian.net/browse/ATH-1494). Authors now get correct upload rights. See: [ATH-1494](https://envato.atlassian.net/browse/ATH-1494), [ATH-1495](https://envato.atlassian.net/browse/ATH-1495)
* [Stopped sending W-form emails](https://envato.atlassian.net/browse/ATH-1520). This was causing Google to block Envato accounts.
* [Fixed production issues](https://envato.atlassian.net/browse/ATH-1522): invoice processing, Storybook deployment. See: [ATH-1522](https://envato.atlassian.net/browse/ATH-1522), [ATH-1525](https://envato.atlassian.net/browse/ATH-1525)
```

**Another example (Authz team):**
```markdown
Wins:
-----

* Loads of KTLO support done (more than usual)
* Made some progress on our GDPR spikes - 1 finished, 3 in review
* Fast turnaround on new scope - building the SSO query API for workato to retrieve user data
```

### Challenges Section
- **Use simple language**: "Problem: X. Solution: Y."
- **Use bullet points**: One bullet per challenge
- **Be brief**: 1-2 sentences per challenge
- **Be constructive**: Acknowledge challenges without making the team look bad
- **Include mitigation**: Note how challenges were addressed in simple terms

**Example from real sprint report:**
```markdown
Challenges and risks:
---------------------

* Verifying three systems working together. Each system deploys at different times. All connections verified before launch.
* Verification expiry could affect authors with non-English names. Paused that group for review. Completed 1,826 verifications safely.
```

**Another example (Data Engineering):**
```markdown
Challenges and risks:
---------------------

* Impact of the new App - analysis and risk assessment.
* Navigating ingestion via Airbyte - ongoing issues with data and persistent issues (bugs) - we are however working with Airbyte to smoothen these issues out.
```

### Additional Notes Section
- **Keep it very brief**: 3-4 bullets max
- **Forward-looking**: What's coming next? Focus on concrete commitments or timelines
- **One bullet per topic**
- **No sub-bullets or details**
- **Optional sections**: Only include if there's something noteworthy (upcoming launches, major initiatives starting, dependencies, monitoring changes)

**Example from real sprint report:**
```markdown
Additional Notes:
-----------------

* Discrepancy Management automated emails launch November 10th.
* Next sprint will add address and date of birth mismatch detection.
* Tuning DataDog alert thresholds to reduce noise.
```

## Output Format

Save as `sprint-report/dd-mm-yyyy/OUTPUT.md`:

```markdown
**Domain: Author**

**Team:** Author

**Sprint Start**: YYYY-MM-DD

**End Date:** YYYY-MM-DD

Sprint Goal:
------------

**Goal**: [Sprint goal statement]

**Status**: Done

[1-2 sentences explaining what was achieved]

Wins:
-----

### [Initiative Name]
* [Major accomplishment with Jira link](https://envato.atlassian.net/browse/XXX-XXXX). [Impact or benefit]. See: [XXX-XXXX](https://envato.atlassian.net/browse/XXX-XXXX), [XXX-YYYY](https://envato.atlassian.net/browse/XXX-YYYY)
* [Another accomplishment](https://envato.atlassian.net/browse/XXX-ZZZZ). [Brief impact].

### Platform Reliability & KTLO
* [KTLO item](https://envato.atlassian.net/browse/XXX-AAAA). [Brief impact].

Challenges and risks:
---------------------

* [Challenge 1 in 1-2 sentences]. [How handled].

* [Challenge 2 in 1-2 sentences]. [How addressed].

Additional Notes:
-----------------

* [Forward-looking note 1].

* [Forward-looking note 2].

---

Key Metrics:
------------

**Sprint Burnup**
[One sentence about sprint progress]

**Velocity**
[One sentence about velocity]

**Cycle time**
[One sentence about cycle time]
```

## Expected Output

- File: `sprint-report/dd-mm-yyyy/OUTPUT.md` (where dd-mm-yyyy matches the source directory)
- Format: Matches the sprint report template from Confluence
- Content: Improved draft with better context and executive-friendly language
- Language: Simple, direct, accessible to non-native English speakers
- Sections: Complete with Sprint Goal, Wins, Challenges, Additional Notes, Metrics
- Quality: Clear, concise, business-focused, no jargon, short sentences

## Common Mistakes to Avoid

- **Too much detail**: Don't list every ticket or every accomplishment
- **Technical jargon**: Use "user" not "system user", "fix" not "remediate"
- **Passive voice**: "System blocks" not "Author is blocked"
- **Listing tickets**: Don't make tickets the subject ("ATH-1512 fixed X"). Instead: "Fixed X. See ATH-1512"
- **Nested bullets**: Keep it flat with only one level under section headers
- **Vague benefits**: "Improved experience" is vague. "Reduces support tickets by 30%" is specific
- **Forgetting the "why"**: Always answer "why does this matter?" after stating what was done

## Tone and Voice

**Be professional but realistic:**
- ✅ "Strong progress" not "Excellent performance"
- ✅ "Completed 90% of planned work" not "Over-delivered with 110% completion"
- ✅ "Team kept focus while handling emergencies" not "Team demonstrated incredible discipline"
- ✅ "Fixed production issues" not "Seamlessly resolved critical blockers"

**Avoid:**
- Overly optimistic language ("amazing", "exceptional", "outstanding")
- Diminishing challenges ("minor issues", "small setbacks")
- Making promises about future sprints ("We will definitely...")
- Being defensive ("Despite challenges", "In spite of...")

**Good tone examples:**
- "System now blocks authors when discrepancies are detected."
- "Completed core pipeline work across three systems."
- "Handled production issues promptly."
- "Some complex cases paused for review."

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

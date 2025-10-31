# Collect Feedback Information

This prompt coordinates the **information collection** phase for generating team feedback reports.

## Task

Execute these steps in sequence:

1. **Step 1: Get Current Feedback Document** (see details below)
2. **Step 2: Collect Slack Activity** (see details below)
3. **Step 3: Collect Jira Work Activity** (see details below)
4. **Step 4: Collect Culture Amp 1-on-1 Data** (see details below)

If for whatever reason the task cannot be completed, explain the issue and ask if the user wants to retry those failures.

## Output Structure

All output goes into `feedback/dd-mm-yyyy/`:
- `current-doc.md` - Current feedback document from Google Drive
- `slack-{firstname}.md` - Slack activity analysis for each team member (5 files)
- `jira-{firstname}.md` - Jira work analysis for each team member (5 files)
- `culture-{firstname}.md` - Culture Amp conversation analysis for each team member (5 files)

## Context

### Target Document
- File ID: `1JRQS1rBc7XmNJkt28ZvKFB4oIY239vyv5HaOaGwjhiY`
- Document: "Feedback To Reports"
- Contains: Historical feedback entries for each team member

### Important: Review Context First
**Before starting**:
1. **Review the em-knowledgebase** to understand:
   - Team health signals and patterns to watch for
   - What types of contributions matter most
   - Communication patterns and collaboration indicators
   - Performance indicators and growth signals
2. **Read the `recipes/people-info.md` file** to get information about:
- Manager information (Jonathan Williams)
- Team member details (Matt, Ana, Ai, Niko, Shannon) including:
  - Email addresses
  - Slack IDs
  - Jira account IDs
  - Culture Amp URLs

## Step 1: Get Current Feedback Document

### Goal
Read and save the current state of the Google Drive document as a markdown file.

### Instructions
1. Read the Google Drive document with ID `1JRQS1rBc7XmNJkt28ZvKFB4oIY239vyv5HaOaGwjhiY` (document named "Feedback To Reports")
2. Convert the content to markdown format
3. Save the content to `feedback/dd-mm-yyyy/current-doc.md`

### Process
- Use the MCP Google Drive tools to read the document
- Parse the content to extract all feedback entries for each person
- Note the date of the last feedback entry for each person
- Save as clean markdown in the current-doc.md file

### Expected Output
- File: `feedback/dd-mm-yyyy/current-doc.md`
- Contains: The entire current state of the feedback document

## Step 2: Collect Slack Activity

### Goal
Generate individual Slack activity reports for each team member.

### Important: Review Context First
**Before starting**:
1. **Review the em-knowledgebase** to understand:
   - Communication patterns and collaboration indicators to look for
   - Team health signals and engagement patterns
   - What types of contributions demonstrate value
   - Channels where meaningful activity occurs
2. **Read the `recipes/people-info.md` file** to get information about all team members.

### Instructions
For each team member:
1. Search for their recent Slack messages (last 7 days)
2. Analyze their communication patterns, contributions, and engagement
3. Note: Only look at messages since their last feedback entry
4. Generate insights about their work, collaboration, and communication

### Process
- Use Slack MCP tools to search messages for each person
- Focus on messages from the past week (or since last feedback entry from current-doc.md)
- Analyze:
  - Communication frequency and quality
  - Technical contributions
  - Collaboration patterns
  - Areas of focus and interest
  - Any notable achievements or concerns

### Output Format
For each person, create `feedback/dd-mm-yyyy/slack-{firstname}.md` with:
- Summary of activity
- Key messages and contributions
- Communication patterns
- Noteworthy discussions or achievements
- Any concerns or areas for improvement

### Expected Files
- `feedback/dd-mm-yyyy/slack-matt.md`
- `feedback/dd-mm-yyyy/slack-ana.md`
- `feedback/dd-mm-yyyy/slack-ai.md`
- `feedback/dd-mm-yyyy/slack-niko.md`
- `feedback/dd-mm-yyyy/slack-shannon.md`

## Step 3: Collect Jira Work Activity

### Goal
Generate individual Jira work activity reports for each team member.

### Important: Review Context First
**Before starting**:
1. **Review the em-knowledgebase** to understand:
   - Current initiatives and epics that indicate important work
   - Types of work that demonstrate impact and value
   - Key systems and their business importance
   - Compliance and SOX work that requires recognition
2. **Read the `recipes/people-info.md` file** to get Jira account IDs and email addresses for all team members.

### Instructions
For each team member:
1. Search Jira for recently completed work items assigned to them in the ATH project
2. Analyze their work patterns, completion rate, and technical contributions
3. Note: Only look at work completed since their last feedback entry
4. Generate insights about their work quality, velocity, and focus areas

### Process
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

**GitHub Tools for Additional Context:**

You can use GitHub tools to find pull requests related to completed Jira tickets:

**Available GitHub Tools:**
- `gh_search_prs` - Search for PRs that mention Jira ticket numbers (e.g., "ATH-1512")
- `gh_search_commits` - Search commits that reference ticket numbers
- `gh_pr_view` - View detailed PR information to understand technical implementation
- `gh_repo_list` - List repositories to identify relevant repos

**Use GitHub tools to:**
- Find PRs related to completed tickets for technical context
- Understand implementation details and code quality
- Verify PR links mentioned in ticket descriptions
- Search for PRs by author if GitHub username matches ticket assignee

**Example searches:**
- `gh_search_prs` with query "ATH-1512" to find PRs mentioning that ticket
- Search for PRs by author if you know their GitHub username

### Output Format
For each person, create `feedback/dd-mm-yyyy/jira-{firstname}.md` with:
- Summary of completed work
- List of key issues/tickets completed
- Analysis of work patterns
- Technical contributions
- Work quality and consistency
- Notable achievements

### Expected Files
- `feedback/dd-mm-yyyy/jira-matt.md`
- `feedback/dd-mm-yyyy/jira-ana.md`
- `feedback/dd-mm-yyyy/jira-ai.md`
- `feedback/dd-mm-yyyy/jira-niko.md`
- `feedback/dd-mm-yyyy/jira-shannon.md`

## Step 4: Collect Culture Amp 1-on-1 Data

### Goal
Generate individual Culture Amp 1-on-1 conversation reports for each team member by using Playwright to extract data from their Culture Amp pages. Playwright will control a browser that is already authenticated with Culture Amp.

### Important: Read People Information First
**Before starting**, read the `recipes/people-info.md` file to get Culture Amp URLs and email addresses for all team members.

### Instructions
For each team member:
1. Navigate to their Culture Amp conversation history page
2. Extract the page content using Playwright and JavaScript
3. Analyze their recent 1-on-1 conversation topics, notes, and actions
4. Look for trends in their engagement, challenges, achievements, and feedback
5. Note any recent updates or completed actions

### Process
Use the Playwright MCP browser tools to navigate and extract content. The browser is already authenticated with Culture Amp.

**CRITICAL DISCOVERY**: Culture Amp's History tab displays conversation topics with note counts, but the actual conversation NOTES are hidden in expandable sections that require clicking "Show notes" buttons before extraction.

**Proper Approach:**
1. Navigate to their Culture Amp URL (with `?tab=history` parameter)
2. **CRITICAL STEP**: Click ALL "Show notes" or "Show note" buttons for the 2-3 most recent conversations to expand the note sections (clicking automatically waits for elements, no need for explicit waits)
3. Take a snapshot using `browser_snapshot()` to get the structured data including all expanded notes
4. Parse the snapshot to extract conversation content from the nested regions:
   - Recent conversation topics and when they were completed
   - **ACTUAL NOTES/INSIGHTS from each conversation topic**
   - Number of notes per topic
   - Actions completed with details
   - Chronological conversation history
   - Key topics discussed and their contents

**IMPORTANT**: Without clicking "Show notes" buttons first, snapshots will NOT contain the actual conversation notes - only topic titles and counts. You MUST expand the note sections before taking snapshots.

**Analysis points:**
- Topics covered in recent conversations
- Frequency of 1-on-1s
- Types of challenges or roadblocks mentioned
- Achievements and wins highlighted
- Action items and their completion status
- Feedback given and received
- Overall engagement level and patterns

**Required approach to get actual notes:**

```javascript
// Step 1: Navigate to the Culture Amp URL
browser_navigate(url)

// Step 2: Expand all note sections by clicking "Show notes" buttons
// Find all buttons with "Show notes" or "Show note" in their text
// Click each one to expand the conversation notes
browser_click()  // for each "Show notes" button

// Step 3: Take a snapshot to get structured data including expanded notes
browser_snapshot()

// Step 4: Parse the snapshot to extract conversation notes, dates, topics, actions, etc.
// The snapshot NOW contains the actual conversation notes in a structured format
```

**Without clicking "Show notes" buttons, the snapshot will NOT contain the actual conversation notes - only topic titles and note counts.**

**Technical notes:**
- **MUST click "Show notes" buttons before taking snapshot** - The note content is hidden in expandable UI elements
- **Use `browser_snapshot()` after expanding notes** - This provides structured data from all expanded notes
- The snapshots provide nested regions with actual note content once expanded
- The History tab provides the most useful data for recent conversations
- **Without expansion, snapshots will NOT contain the actual notes** - only topic titles and counts
- After expanding and snapshotting, parse the snapshot regions to extract structured information about conversations, notes, and actions
- Typical process: Click all "Show notes" buttons for the 2-3 most recent conversations, then take snapshot, then extract notes from snapshot regions
- No need for explicit waits - click actions automatically wait for elements to appear
- **Do not use `document.body.textContent` or `browser_evaluate`** - use snapshots after clicking to expand notes

### Output Format
For each person, create `feedback/dd-mm-yyyy/culture-{firstname}.md` with:

### Conversation Summary
- Recent conversation dates
- Number of conversations since last feedback entry
- Key topics covered

### Recent Topics Discussed
- List of recent conversation topics
- Notes and insights from each topic
- Completion status

### Action Items
- Actions assigned to the person
- Actions they completed
- Pending or overdue actions

### Key Insights
- Notable achievements or wins
- Challenges or roadblocks identified
- Feedback trends
- Growth areas

### Expected Files
- `feedback/dd-mm-yyyy/culture-matt.md`
- `feedback/dd-mm-yyyy/culture-ana.md`
- `feedback/dd-mm-yyyy/culture-ai.md`
- `feedback/dd-mm-yyyy/culture-niko.md`
- `feedback/dd-mm-yyyy/culture-shannon.md`

## How It Works

### Step 1: Get Current Feedback Document
Read the existing feedback document to determine:
- The last feedback entry date for each team member
- The format and structure of existing entries
- Areas of focus in recent feedback

### Step 2: Collect Slack Activity
Search for each team member's messages and analyze:
- Communication patterns and frequency
- Technical contributions and discussions
- Collaboration and engagement
- Notable achievements or concerns

Search period: **Last 7 days** or since their last feedback entry.

Key channels to analyze:
- Team channels: `#author-domain`
- Cross-team: `#author-product-trio`
- Leadership: `#author-leadership`
- Deployments: `#env-deployments`
- Any channels where they actively contribute

### Step 3: Collect Jira Work Activity
Search for completed work assigned to each team member in the ATH project:
- Types of work (features, bugs, improvements)
- Work complexity and impact
- Velocity and consistency
- Technical approach and solutions

Search period: Work completed in **last 7 days** or since their last feedback entry.

### Step 4: Collect Culture Amp 1-on-1 Data
Extract recent 1-on-1 conversation history for each team member:
- Conversation topics discussed
- Frequency and regularity of meetings
- Notes and insights shared
- Action items and their status
- Engagement patterns and participation

## Types of Information to Capture

### Communication & Collaboration
- Frequency and quality of Slack communication
- Participation in team discussions
- Knowledge sharing and mentoring
- Cross-team collaboration

### Technical Contributions
- Code quality and approach
- Problem-solving skills
- Technical decision-making
- Innovation and improvements

### Work Delivery
- Velocity and consistency
- Work complexity handled
- Delivery quality
- Project impact

### Professional Growth
- Skill development
- Areas of interest
- Challenges faced
- Feedback given and received

### Engagement
- Participation in 1-on-1s
- Engagement in conversations
- Proactive communication
- Team contribution

## Timeline

Default collection period: **7 days** or since the last feedback entry for each team member.

The current document provides the baseline date for each person's last entry, and the collection should focus on activity since that date.

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

All output goes into `files/output/feedback-dd-mm-yyyy/`:
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
2. **Read the `files/recipe-config/people-info.md` file** to get information about:
- Manager information (Jonathan Williams)
- Team member details (Matt, Ana, Ai, Niko, Shannon) including:
  - Email addresses
  - Slack IDs
  - Jira account IDs
  - Culture Amp URLs

## Step 1: Get Current Feedback Document

### Goal
Copy the current feedback document from the most recent run and update it to match the Google Drive version.

### Instructions
1. Find the most recent date-stamped directory in `files/output/` matching `feedback-*` (e.g., `files/output/feedback-03-11-2025/`)
2. Copy `current-doc.md` from that directory to `files/output/feedback-dd-mm-yyyy/current-doc.md`
3. Read the Google Drive document with ID `1JRQS1rBc7XmNJkt28ZvKFB4oIY239vyv5HaOaGwjhiY` (document named "Feedback To Reports")
4. Update the copied file to match the Google Drive version (typically just the most recent entry section needs updating)

### Process
- Copy the existing `current-doc.md` from the most recent date directory
- Use the MCP Google Drive tools to read the document
- **Important: Handle Large File Responses**
  - If the Google Drive tool responds with a message containing "Large output has been written to:" followed by a file path (e.g., "Large output has been written to: /Users/jonathanwilliams/.cursor/projects/.../file.txt (55.9 KB, 871 lines)")
  - **DO NOT recreate the file** - instead, extract the file path from the message and simply copy it using:
    ```bash
    cp /extracted/path/to/file.txt files/output/feedback-dd-mm-yyyy/current-doc.md
    ```
  - Extract the full file path from the message (everything between "Large output has been written to: " and the opening parenthesis)
  - This is much more efficient than recreating large files and avoids unnecessary processing
- If the tool returns content directly, compare the Google Drive content with the copied file
- Update the copied file to match the Google Drive version (usually only the latest entry section has changed)
- Note the date of the last feedback entry for each person

### Expected Output
- File: `files/output/feedback-dd-mm-yyyy/current-doc.md`
- Contains: The entire current state of the feedback document, updated to match Google Drive

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
2. **Read the `files/recipe-config/people-info.md` file** to get information about all team members.

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
For each person, create `files/output/feedback-dd-mm-yyyy/slack-{firstname}.md` with:
- Summary of activity
- Key messages and contributions
- Communication patterns
- Noteworthy discussions or achievements
- Any concerns or areas for improvement

### Expected Files
- `files/output/feedback-dd-mm-yyyy/slack-matt.md`
- `files/output/feedback-dd-mm-yyyy/slack-ana.md`
- `files/output/feedback-dd-mm-yyyy/slack-ai.md`
- `files/output/feedback-dd-mm-yyyy/slack-niko.md`
- `files/output/feedback-dd-mm-yyyy/slack-shannon.md`

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
2. **Read the `files/recipe-config/people-info.md` file** to get Jira account IDs and email addresses for all team members.

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
For each person, create `files/output/feedback-dd-mm-yyyy/jira-{firstname}.md` with:
- Summary of completed work
- List of key issues/tickets completed
- Analysis of work patterns
- Technical contributions
- Work quality and consistency
- Notable achievements

### Expected Files
- `files/output/feedback-dd-mm-yyyy/jira-matt.md`
- `files/output/feedback-dd-mm-yyyy/jira-ana.md`
- `files/output/feedback-dd-mm-yyyy/jira-ai.md`
- `files/output/feedback-dd-mm-yyyy/jira-niko.md`
- `files/output/feedback-dd-mm-yyyy/jira-shannon.md`

## Step 4: Collect Culture Amp 1-on-1 Data

### Goal
Generate individual Culture Amp 1-on-1 conversation reports for each team member using the `cultureamp_get_conversation` MCP tool.

### Important: Read People Information First
**Before starting**, read the `files/recipe-config/people-info.md` file to get Culture Amp conversation IDs and email addresses for all team members.

### Instructions
For each team member:
1. Extract the conversation ID from their Culture Amp URL in `people-info.md`
2. Use the `cultureamp_get_conversation` tool to fetch their conversation data
3. Analyze their recent 1-on-1 conversation topics, notes, and actions
4. Look for trends in their engagement, challenges, achievements, and feedback
5. Note any recent updates or completed actions

### Process
Use the `cultureamp_get_conversation` MCP tool to fetch conversation data directly from the Culture Amp API.

**Step 1: Extract Culture Amp Authentication Tokens**

Before calling `cultureamp_get_conversation`, you need to extract authentication tokens from your browser cookies using the `extract_cookies` tool with Culture Amp specific arguments:

```javascript
extract_cookies({
  url: "https://envato.cultureamp.com/app/home",
  cookieNames: ["cultureamp.production-us.token", "cultureamp.production-us.refresh-token"],
  waitForIndicators: ["JW"],
  maxWaitTime: 40000,
  headless: false
})
```

**Important Notes:**
- The browser window will open (not headless) - make sure you're logged into Culture Amp
- The tool waits for the "JW" indicator to appear, which indicates the page has loaded and you're logged in
- The tool will extract the `cultureamp.production-us.token` and `cultureamp.production-us.refresh-token` cookies
- Parse the JSON response to get the token values for use with `cultureamp_get_conversation`

**Step 2: Extract Conversation IDs**

- The conversation ID is the UUID in the Culture Amp URL
- Example: `https://envato.cultureamp.com/app/conversations/0190791e-69f0-7057-939d-8bd02ca7b7b3?tab=history`
- Conversation ID: `0190791e-69f0-7057-939d-8bd02ca7b7b3`

**Step 3: Use the tool**

Call the `cultureamp_get_conversation` tool for each team member with the extracted tokens:
```javascript
cultureamp_get_conversation({
  conversation_id: "0190791e-69f0-7057-939d-8bd02ca7b7b3", // Extract from files/recipe-config/people-info.md URL
  token: "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6InY3WF93UUxKTDNPSDBHRC1WQkhMTkctZGlHYyJ9...", // From extract_cookies
  refresh_token: "h666XzNjOHS55nsWlzim5iz7p3QGiOfd-iUU23LsxSbeJGwTXvn6btXOGJV_zbJ-" // From extract_cookies
})
```

The tool returns a formatted markdown summary with:
- **Summary section**: Title, participants, dates, completed topics count, topic types breakdown
- **All completed topics**: Full details including type, creation/completion dates, attachments
- **Attachments for each topic**: Notes, responses, check-ins, attachment events
- **Chronological conversation history**: All topics ordered by completion date

**What the tool provides:**
- All completed topics with full details
- Notes and responses from conversations (extracted from attachment content)
- Check-in data (when available, including wellbeing scores)
- Attachment events (complete, reopen, delete events)
- Action items and their status (from action-type topics)
- Topic type categorization (check_in, challenge, highlight, user, action)
- Full attachment history for each topic

**Analysis points:**
- Topics covered in recent conversations (from completed topics list)
- Frequency of 1-on-1s (from completion dates - look for patterns)
- Types of challenges or roadblocks mentioned (from challenge-type topics and responses)
- Achievements and wins highlighted (from highlight-type topics and responses)
- Action items and their completion status (from action-type topics)
- Feedback given and received (from user-type topics and notes)
- Overall engagement level and patterns (from check-ins and response frequency)

### Output Format
For each person, create `files/output/feedback-dd-mm-yyyy/culture-{firstname}.md` with:

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
- `files/output/feedback-dd-mm-yyyy/culture-matt.md`
- `files/output/feedback-dd-mm-yyyy/culture-ana.md`
- `files/output/feedback-dd-mm-yyyy/culture-ai.md`
- `files/output/feedback-dd-mm-yyyy/culture-niko.md`
- `files/output/feedback-dd-mm-yyyy/culture-shannon.md`

## How It Works

### Step 1: Get Current Feedback Document
Copy the most recent `current-doc.md` from the previous run and update it to match Google Drive:
- Copy from the most recent date-stamped directory in `files/output/` matching `feedback-*`
- Read the Google Drive document to get the latest version
- **If the tool writes to a temp file** (response contains "Large output has been written to:"), extract the file path from the message and copy it: `cp /extracted/path/to/file.txt files/output/feedback-dd-mm-yyyy/current-doc.md` (extract path between "Large output has been written to: " and the opening parenthesis)
- If content is returned directly, update the copied file to match (typically only the most recent entry section needs updating)
- Determine the last feedback entry date for each team member
- Note the format and structure of existing entries
- Identify areas of focus in recent feedback

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
Use the `cultureamp_get_conversation` MCP tool to fetch conversation data for each team member:
- **First, extract authentication tokens** using `extract_cookies` with Culture Amp specific arguments:
  - `url: "https://envato.cultureamp.com/app/home"`
  - `cookieNames: ["cultureamp.production-us.token", "cultureamp.production-us.refresh-token"]`
  - `waitForIndicators: ["JW"]`
- Extract conversation IDs from `files/recipe-config/people-info.md` URLs
- Call `cultureamp_get_conversation` with each conversation ID and the extracted tokens
- Extract and analyze:
  - Conversation topics discussed (from completed topics)
  - Frequency and regularity of meetings (from completion dates)
  - Notes and insights shared (from attachments)
  - Action items and their status (from action topics)
  - Engagement patterns and participation (from check-ins and responses)

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

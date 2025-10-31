# Daily Checkup - Complete Status Report

Perform all daily checkup tasks in sequence and provide a comprehensive summary.

## Before Starting

**Review the em-knowledgebase** to understand:
- What matters most for daily checkups
- Key systems and initiatives to be aware of
- Red flags and signals to watch for
- Common patterns and escalation triggers

This context will help you prioritize issues and identify what needs immediate attention.

## Instructions

Execute the following steps in order:

1. **Author Helpline Check** (see details below)
2. **Jira Tickets Check** (see details below)
3. **AWS Access Request Check** (see details below)
4. **BambooHR Time Off Requests Check** (see details below)

## Step 1: Check Author Helpline

### Instructions

1. Search the #author-helpline channel for messages from the last 3 days
2. Look for messages that don't have green tick emojis (✅) or Jira emojis (:jira:) indicating they've been addressed
3. For each unaddressed issue:
   - Provide a direct Slack link to the message
   - Summarize the issue briefly
   - Note if there's been discussion in the thread or if it remains unanswered
4. Give a summary count of unaddressed issues

### Expected Output

Provide direct feedback in conversation format with:
- Direct Slack links to unaddressed issues
- Brief summaries of each issue
- Discussion status (has replies vs unanswered)
- Total count of unaddressed issues

Do not create any documents - just provide the information directly in the conversation.

## Step 2: Check Jira Tickets

### Context

Before checking tickets, review the em-knowledgebase to understand:
- Important labels and epics to prioritize (e.g., SOX, active initiatives)
- Which ticket types and statuses indicate blockers or urgent issues
- Red flags that signal tickets need immediate attention

### Instructions

1. Search Jira for issues assigned to the current user
2. Filter for active statuses (exclude Done, Closed, Resolved, Verified, Released)
3. For each active ticket:
   - Provide a direct Jira link
   - Show summary, status, priority, and issue type
   - Show creation and last updated dates
   - Include any relevant labels
4. Organize by status (To Do, In Progress, Backlog, etc.)
5. Give a total count of active tickets

**GitHub Tools for Additional Context:**

You can use GitHub tools to find pull requests related to active tickets:

**Available GitHub Tools:**
- `gh_search_prs` - Search for PRs that mention Jira ticket numbers
- `gh_search_commits` - Search commits that reference ticket numbers
- `gh_pr_view` - View detailed PR information if PRs are found
- `gh_repo_list` - List repositories to identify relevant repos

**Use GitHub tools to:**
- Find PRs related to tickets in progress (for technical context)
- Verify PR links mentioned in ticket descriptions
- Understand implementation progress for in-progress work
- Search for PRs by author if GitHub username matches ticket assignee

**Note:** This is optional - use GitHub tools only if you want to provide additional context about related PRs for active tickets.

### Expected Output

Provide direct feedback in conversation format with:
- Direct Jira links to each active ticket
- Organized list by status with key details
- Total count of active tickets
- Brief summary of workload

Do not create any documents - just provide the information directly in the conversation.

## Step 3: Check AWS Access Request Notifications

### Instructions

1. Search Slack for messages from the TEAM bot since yesterday morning using `filter_users_from: team`
2. Filter for "AWS Access Request Notification" messages
3. Get the conversation history for the channel with ID `D07N5KT40MT` to see the message contents
4. For each notification found:
   - Construct the Slack link using the format: `https://envato.slack.com/archives/D07N5KT40MT/p[MESSAGE_ID]`
   - Show the timestamp of the request
   - Note that these are interactive notifications requiring approval/denial
5. Give a count of pending AWS access requests

### Important Notes

- The TEAM bot's messages are in channel ID `D07N5KT40MT` (not the user ID from search results)
- When constructing Slack links, use the format: `https://envato.slack.com/archives/D07N5KT40MT/p[msgID]`
- Message IDs from the search results need to be used exactly as they appear
- The message content itself may not be accessible, but the links will allow viewing in Slack

### Expected Output

Provide direct feedback in conversation format with:
- Direct, clickable Slack links to each pending AWS access request notification in the format: `[link text](url)`
- Timestamps of when requests were made
- Total count of pending requests
- Note that these require manual review and approval/denial in Slack

Do not create any documents - just provide the information directly in the conversation.

## Step 4: Check BambooHR Time Off Requests

### Instructions

1. Use playwright to navigate to the BambooHR inbox at: https://envato.bamboohr.com/inbox/
2. **Authentication Note**: If the page redirects to Okta sign-in, inform the user that they need to sign in manually, and ask them to tell you when they have completed authentication so you can proceed.
3. Once authenticated and the inbox page loads, check if there are any pending time off requests
4. If requests are visible:
   - Provide the request details (employee name, dates, type)
   - Note the status of the request
   - Include a link to view the full request
5. If no requests are present, confirm the "no requests" message
6. Give a count of pending requests

### Important Notes

- This requires navigating to BambooHR using Playwright
- **BambooHR requires Okta authentication** - the page will redirect to a sign-in page if not authenticated
- If you see a sign-in page, inform the user and wait for confirmation that they have signed in before proceeding
- Once authenticated, navigate to the inbox page again
- The inbox page will show all pending approval requests
- Look for the "Requests" section on the page
- If you see "You have no more requests!" or "It's a great day! You have no more requests!" that means inbox is clear

### Expected Output

Provide direct feedback in conversation format with:
- Count of pending time off requests
- Details for each request (if any)
- Link to view the request in BambooHR
- Confirmation if inbox is clear

Do not create any documents - just provide the information directly in the conversation.

## Final Summary Format

After completing all four checks, provide a comprehensive summary:

---

# Daily Checkup Summary - [DATE]

## Author Helpline Status
- **Unaddressed Issues**: [COUNT]
- **Issues with Discussion**: [COUNT]
- **Unanswered Issues**: [COUNT]

**Unaddressed Issues:**
1. [Issue Title] - [Slack Link]
   - Status: [Has Discussion/Unanswered]
   - Summary: [Brief description]

## Jira Tickets Status
- **Total Active Tickets**: [COUNT]
- **To Do**: [COUNT]
- **In Progress**: [COUNT]
- **Backlog**: [COUNT]

**Active Tickets:**
1. [Ticket Key] - [Ticket Title] - [Jira Link]
   - Status: [Status] | Priority: [Priority] | Type: [Type]
   - Created: [Date] | Updated: [Date]
   - Labels: [Labels if any]

## AWS Access Request Status
- **Pending Requests**: [COUNT]

**Pending AWS Access Requests:**
1. [Request Date/Time] - [Slack Link]
   - Status: Pending approval/denial
   - Note: Click link to review details and approve/deny

## BambooHR Time Off Request Status
- **Pending Requests**: [COUNT]

**Pending Time Off Requests:**
1. [Employee Name] - [BambooHR Link]
   - Dates: [Date range]
   - Status: Pending approval
   - Note: Click link to review and approve/deny in BambooHR

## Overall Status
- **Action Required**: [Summary of what needs attention]
- **Priority Items**: [List any high priority items]

---

Do not create any documents - provide this summary directly in the conversation.

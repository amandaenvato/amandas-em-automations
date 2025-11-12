# Daily Checkup - Complete Status Report

Perform all daily checkup tasks in sequence and provide a comprehensive summary.

## Before Starting

**Review the em-knowledgebase** to understand:
- What matters most for daily checkups
- Key systems and initiatives to be aware of
- Red flags and signals to watch for
- Common patterns and escalation triggers

This context will help you prioritize issues and identify what needs immediate attention.

## Output Structure

1. **Create a dated directory**: `recipes/daily-checkup/dd-mm-yyyy/` (e.g., `recipes/daily-checkup/15-01-2025/`)
2. **Create OUTPUT.md** in that directory with the full comprehensive analysis (using the format below)
3. **Respond in conversation** with ONLY the "Action Required" section formatted as markdown with working links

## Instructions

Execute the following steps in order:

1. **Author Helpline Check** (see details below)
2. **Jira Tickets Check** (see details below)
3. **AWS Access Request Check** (see details below)
4. **BambooHR Time Off Requests Check** (see details below)
5. **Tasks Summary** (see details below)
6. **Saved Slack Messages Check** (see details below)
6.5. **Slack Mentions and Action Items Check** (see details below)
6.6. **Additional Slack Pages Check** (see details below)
7. **Calendar Facilitate Meetings Check** (see details below)

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

1. Use the `fetch_page` tool to navigate to the BambooHR inbox at: https://envato.bamboohr.com/inbox/
   - **waitForIndicators**: Use `['Requests']` to wait for the page to load
   - **maxWaitTime**: 120000 (2 minutes)
   - **headless**: false (to allow authentication if needed)
2. **Authentication Note**: If the page redirects to Okta sign-in, the browser window will open and wait for you to sign in manually. Once authenticated, the page should redirect back to the inbox.
3. Parse the HTML content returned by `fetch_page` to check if there are any pending time off requests
4. If requests are visible:
   - Provide the request details (employee name, dates, type)
   - Note the status of the request
   - Include a link to view the full request
5. If no requests are present, confirm the "no requests" message
6. Give a count of pending requests

### Important Notes

- Use the `fetch_page` tool to access the BambooHR inbox - it will save your logged-in session state for faster subsequent calls
- **BambooHR requires Okta authentication** - the page will redirect to a sign-in page if not authenticated
- The browser window will open (not headless) to allow manual authentication if needed
- The `fetch_page` tool waits for the "Requests" indicator, which appears once the inbox page has loaded
- Once authenticated, your session state will be saved, so subsequent calls will be faster
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

## Step 5: Check Tasks

### Instructions

1. Read the tasks from `task-manager/tasks.jsonl` file
2. Parse the JSONL format (each line is a JSON object)
3. **Only include active tasks** - completed tasks are in `completed-tasks.jsonl` and should be ignored
4. Analyze the tasks and group them into logical categories such as:
   - Team Management & People Development
   - On-Call & Operations
   - Documentation & Process
   - Training & Learning
   - Team Feedback & Reviews
   - Communication & Events
   - Operational/Maintenance
   - Or other relevant groupings based on task content
5. For each task, include:
   - Task title
   - Due date (if available)
   - From (person who requested it, if available)
   - Description (if available)
6. Note any tasks with upcoming due dates or overdue tasks
7. Identify stale tasks (e.g., tasks from months ago that may need review or cleanup)

### Important Notes

- Read tasks directly from `task-manager/tasks.jsonl` file
- Focus only on active tasks - completed tasks are in a separate file
- Group tasks logically to make the summary more actionable
- Highlight tasks that need immediate attention (due soon, overdue, or stale)

### Expected Output

Provide direct feedback in conversation format with:
- Overall statistics (total active tasks, overdue count, due today count)
- Grouped list of active tasks by category
- Each task showing title, due date, from (if available), and description (if available)
- Notes on any overdue tasks, tasks due today, or stale tasks that need attention

Do not create any documents - just provide the information directly in the conversation.

## Step 6: Check Saved Slack Messages

### Instructions

1. Use the `fetch_page` tool to navigate to the Slack saved messages page at: `https://app.slack.com/client/E04LQRTKFNH/later`
   - **waitForIndicators**: Use `['Saved', 'In progress', 'css:[data-qa="slack_kit_list"]']` to wait for the page to load
   - **maxWaitTime**: 120000 (2 minutes)
   - **headless**: false (to allow authentication if needed)
2. Parse the **text content** (not just HTML) returned by `fetch_page` to extract saved messages from the "In progress" filter
   - The saved messages appear in the text content in this format:
     - Channel name (e.g., "temp-author-system-migration-to-content-platform")
     - Author name (e.g., "Jared McCorkindale")
     - Message text (may be truncated with "…" if long)
     - For DMs, it shows "Direct message" instead of channel name, followed by author name
3. For each saved message found in the text:
   - Extract the channel name (or note if it's a DM), author name, and message text snippet
   - Use Slack MCP `conversations_search_messages` tool to search for the full message using:
     - Unique phrases from the message text
     - Author name + channel name (if available)
     - Key terms from the message content
   - From the search results, identify the correct message and extract:
     - Full message text
     - Channel ID and message timestamp (for constructing Slack links)
     - Date/time
     - Thread context (if applicable)
4. Analyze each saved message to infer what action or task is needed:
   - Look for explicit requests or questions
   - Identify items requiring responses or follow-up
   - Note any deadlines or time-sensitive items
   - Determine priority based on context and urgency
5. Group messages by priority (High, Medium, Low) or by type of action needed
6. Provide a count of saved messages requiring action

### Important Notes

- Saved messages are accessed via the Slack "Later" page at `https://app.slack.com/client/E04LQRTKFNH/later`
- Focus on messages in the "In progress" filter (these are active items)
- **Key Learning**: The `fetch_page` tool now waits an additional 1500ms after indicators appear to ensure the page is fully rendered. The saved messages are rendered dynamically via JavaScript, so the actual message links/channel IDs are NOT in the static HTML. However, the text content DOES contain the saved messages in a readable format.
- **Extraction Strategy**: Parse the text content (not HTML) to find saved messages. The format is: channel name → author name → message text. Then use Slack search tools to find the full message details and construct proper links.
- The `fetch_page` tool will save your logged-in session state, so subsequent calls will be faster
- Message IDs are found in Slack URLs in the format: `https://envato.slack.com/archives/[CHANNEL_ID]/p[MESSAGE_TIMESTAMP]`
- For DMs, channel IDs start with `D` or `U` prefix
- When searching for messages, use unique phrases from the message text to find the exact message
- Infer actions by analyzing message content for:
  - Questions requiring answers
  - Requests for information or decisions
  - Items needing follow-up
  - Tasks delegated or assigned
  - Deadlines or time-sensitive matters

### Expected Output

Provide direct feedback in conversation format with:
- Count of saved messages requiring action
- List of messages grouped by priority or action type
- For each message:
  - Author name and channel
  - Date/time
  - Full message text or summary
  - Inferred action/task needed
  - Direct Slack link to the message
- Clear indication of what needs to be done for each item

Do not create any documents - just provide the information directly in the conversation.

## Step 6.5: Check Slack Mentions and Action Items

### Instructions

1. Search Slack for messages containing "jdub" (without @ symbol) from the last 7 days
2. Review the search results to identify messages that:
   - Mention jdub directly or indirectly
   - Appear to be requests, questions, or action items
   - Require follow-up or response
3. For each potential action item:
   - Use `conversations_replies` to get full thread context if the message is part of a thread
   - Use `conversations_history` if needed to understand the broader conversation context
   - Identify if the item has been addressed or is still pending
   - Determine the type of action needed (decision, response, follow-up, etc.)
4. For messages that look like unaddressed actions:
   - Extract the full context from the thread
   - Note who mentioned jdub and what they're asking for
   - Identify if there's been a response or if it's still pending
   - Assess priority based on urgency and impact
5. Group identified action items by:
   - Status (Resolved, Pending Response, Needs Decision, etc.)
   - Priority (High, Medium, Low)
   - Type (Technical Question, Process Decision, Access Request, etc.)
6. Construct direct Slack links for each message using format: `https://envato.slack.com/archives/[CHANNEL_ID]/p[MESSAGE_TIMESTAMP]`
   - Channel IDs can be found in the search results or thread replies
   - Use the message timestamp from the search results for the link

### Important Notes

- Search for "jdub" without the @ symbol to catch all mentions (both @mentions and text references)
- Focus on messages from the last 7 days for relevance
- Always get thread context to understand if items have been resolved in follow-up messages
- Look for patterns like:
  - Questions ending with "?"
  - Requests for approval or decision ("WDYT?", "can you...", "should we...")
  - Technical issues that need investigation
  - Access requests or permission needs
  - Status updates that might need acknowledgment
- When constructing Slack links:
  - Channel IDs from search results may need conversion (e.g., channel names like "#author-team" need to be converted to channel IDs)
  - Message timestamps from search results are in format like `1762207610.257819`
  - Full link format: `https://envato.slack.com/archives/C02FF616D09/p1762207610.257819`
- If a message is in a thread, provide the link to the specific message, not just the thread parent

### Expected Output

Provide direct feedback in conversation format with:
- Count of unaddressed action items mentioning jdub from the last 7 days
- List of action items grouped by status and priority
- For each action item:
  - Author name and channel
  - Date/time
  - Full message context (from thread if applicable)
  - Direct Slack link to the message
  - Status (Resolved/Pending/Needs Response)
  - Type of action needed
  - Priority assessment
- Summary of items that need immediate attention vs. those that are informational

Do not create any documents - just provide the information directly in the conversation.

## Step 6.6: Check Additional Slack Pages for Concerning Messages

### Instructions

1. Use the `fetch_page` tool to navigate to three additional Slack pages to check for any concerning messages:
   - **AWS Access Request Channel**: `https://app.slack.com/client/E04LQRTKFNH/D07N5KT40MT`
     - **waitForIndicators**: `['Slack', 'css:[data-qa="slack_kit_list"]']`
   - **Activity Page**: `https://app.slack.com/client/E04LQRTKFNH/activity`
     - **waitForIndicators**: `['Activity', 'css:[data-qa="slack_kit_list"]']`
   - **DMs Page**: `https://app.slack.com/client/E04LQRTKFNH/dms`
     - **waitForIndicators**: `['Direct messages', 'css:[data-qa="slack_kit_list"]']`
   - For all pages: **maxWaitTime**: 120000, **headless**: false

2. For each page:
   - Parse the HTML content returned by `fetch_page` to see visible messages
   - Extract any message IDs or timestamps from visible messages
   - Look for any urgent, concerning, or action-required messages

3. Use Slack MCP tools to get full message details:
   - Use `conversations_history` to get messages from channels if needed
   - Use `conversations_search_messages` with concerning keywords if needed (e.g., "urgent", "emergency", "critical", "escalate", "security", "incident", "error", "failed", "broken", "down")
   - Check DMs by using `conversations_history` with DM channel IDs found on the DMs page

4. Look for concerning patterns:
   - Urgent requests or escalations
   - Security incidents or concerns
   - System errors or failures
   - Messages requiring immediate action
   - Any mentions that might have been missed in the main search

5. For any concerning messages found:
   - Extract full message context using Slack MCP tools
   - Determine if action is needed or if it's already resolved
   - Note the urgency and priority
   - Construct direct Slack links

### Important Notes

- Use the `fetch_page` tool to access these pages - it will save your logged-in session state for faster subsequent calls
- Parse the HTML content returned by `fetch_page` to extract message information
- The AWS Access Request channel (D07N5KT40MT) shows TEAM bot notifications that may need approval
- The Activity page shows mentions, reactions, and thread activity - useful for catching items you might have missed
- The DMs page shows direct messages - check for any unread or concerning DMs
- Not all messages may be immediately visible - use Slack MCP tools to get full conversation history if needed
- Focus on recent messages (last 2-3 days) unless something urgent appears older

### Expected Output

Provide direct feedback in conversation format with:
- Summary of what was found on each page
- Any concerning messages requiring attention (with links and context)
- Note if no concerning messages were found
- Brief confirmation that these additional checks were completed

Do not create any documents - just provide the information directly in the conversation.

## Step 7: Check Calendar Facilitate Meetings

### Instructions

1. Use the Google Calendar API to check today's calendar events
2. Look for events with green color (colorId corresponding to "facilitate" label)
3. For each facilitate meeting found:
   - Include the meeting title
   - Show the time and duration
   - List attendees (if available)
   - Note any attached documents or meeting links
4. If no facilitate meetings are found, note that in the summary
5. Provide a count of facilitate meetings for the day

### Color Mapping Reference

- **Green** = Facilitate (meetings you are facilitating/running)
- Purple = Stakeholder
- Yellow = 1 on 1
- Blue = Personal reminder
- Light blue = "Be present" (meetings you just need to attend)

### Expected Output

Provide direct feedback in conversation format with:
- Count of facilitate meetings for today
- List of each facilitate meeting with:
  - Title and time
  - Duration
  - Attendees (if available)
  - Meeting links or documents
- Note if there are no facilitate meetings scheduled

Do not create any documents - just provide the information directly in the conversation.

## Final Summary Format

After completing all seven checks:

1. **Create the dated directory**: `recipes/daily-checkup/dd-mm-yyyy/` (format: DD-MM-YYYY, e.g., `15-01-2025`)
2. **Write the full comprehensive summary** to `recipes/daily-checkup/dd-mm-yyyy/OUTPUT.md` using the format below
3. **Respond in conversation** with ONLY the "Action Required" section (see format at the end) formatted as markdown with working links

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

## Tasks Summary

**Overall Statistics:**
- **Total Active Tasks**: [COUNT]
- **Overdue Tasks**: [COUNT]
- **Due Today**: [COUNT]

### Active Tasks by Category

#### **[Category Name]** ([COUNT] tasks)
- [Task Title] (Due: [Due Date], From: [Person if available])
- [Task Title] (Due: [Due Date], From: [Person if available])

#### **[Category Name]** ([COUNT] tasks)
- [Task Title] (Due: [Due Date], From: [Person if available])
- [Task Title] (Due: [Due Date], From: [Person if available])

[Continue with additional categories as needed]

**Note**: [Any notes about stale tasks, high-priority items, or items needing immediate attention]

## Saved Slack Messages Status
- **Messages Requiring Action**: [COUNT]
- **High Priority**: [COUNT]
- **Medium Priority**: [COUNT]
- **Low Priority**: [COUNT]

**Saved Messages Requiring Action:**

#### **High Priority**
1. [Author Name] - [Channel] - [Slack Link]
   - Date: [Date/Time]
   - Message: [Summary or excerpt]
   - Action Needed: [Inferred action/task]

#### **Medium Priority**
1. [Author Name] - [Channel] - [Slack Link]
   - Date: [Date/Time]
   - Message: [Summary or excerpt]
   - Action Needed: [Inferred action/task]

#### **Low Priority**
1. [Author Name] - [Channel] - [Slack Link]
   - Date: [Date/Time]
   - Message: [Summary or excerpt]
   - Action Needed: [Inferred action/task]

## Slack Mentions and Action Items Status
- **Unaddressed Action Items**: [COUNT]
- **Resolved**: [COUNT]
- **Pending Response**: [COUNT]
- **Needs Decision**: [COUNT]

**Unaddressed Action Items:**

#### **Pending Response**
1. [Author Name] - [Channel] - [Slack Link](https://envato.slack.com/archives/[CHANNEL_ID]/p[MESSAGE_TIMESTAMP])
   - Date: [Date/Time]
   - Message: [Full context from thread]
   - Type: [Technical Question/Process Decision/Access Request/etc.]
   - Priority: [High/Medium/Low]
   - Status: Pending Response

#### **Needs Decision**
1. [Author Name] - [Channel] - [Slack Link](https://envato.slack.com/archives/[CHANNEL_ID]/p[MESSAGE_TIMESTAMP])
   - Date: [Date/Time]
   - Message: [Full context from thread]
   - Type: [Technical Question/Process Decision/Access Request/etc.]
   - Priority: [High/Medium/Low]
   - Status: Needs Decision

#### **Resolved**
1. [Author Name] - [Channel] - [Slack Link](https://envato.slack.com/archives/[CHANNEL_ID]/p[MESSAGE_TIMESTAMP])
   - Date: [Date/Time]
   - Message: [Summary]
   - Status: Resolved

## Calendar Facilitate Meetings Status
- **Facilitate Meetings Today**: [COUNT]

**Facilitate Meetings (Green Label):**
1. [Meeting Title] - [Time] ([Duration])
   - Attendees: [List of attendees if available]
   - Meeting Link: [Google Meet link if available]
   - Notes: [Any attached documents or notes]

[Continue listing all facilitate meetings if any]

**Note**: [If no facilitate meetings, note that none are scheduled for today]

## Additional Slack Pages Check Status
- **Concerning Messages Found**: [COUNT]
- **AWS Access Request Channel**: [Summary of any urgent items]
- **Activity Page**: [Summary of any missed mentions or urgent items]
- **DMs**: [Summary of any concerning direct messages]

**Concerning Messages (if any):**
1. [Message summary] - [Slack Link]
   - Channel/Type: [Channel name or DM]
   - Date: [Date/Time]
   - Urgency: [High/Medium/Low]
   - Action Needed: [Brief description]

**Note**: [If no concerning messages found, note that additional Slack pages were checked and no urgent items were identified]

## Overall Status
- **Action Required**: [Summary of what needs attention across all systems]
- **Priority Items**: [List any high priority items from all checks, including tasks and saved Slack messages]
- **Facilitate Meetings**: [Include any facilitate meetings that require preparation or action items]

---

## Action Required Section (For Conversation Response)

After writing the full OUTPUT.md file, respond in the conversation with ONLY this section, formatted as markdown with working links:

```markdown
# Action Required - Daily Checkup Summary

## High Priority

### 1. [Action Title]
- **Link**: [Working Slack/Jira/BambooHR link]
- **Details**: [Brief description]
- **Action**: [What needs to be done]

[Continue with all high priority items]

## Medium Priority

[Continue with medium priority items]

## Low Priority / Informational

[Continue with low priority items]

---

**Quick Links:**
- [AWS Access Request Channel](https://app.slack.com/client/E04LQRTKFNH/D07N5KT40MT)
- [Author Helpline](https://envato.slack.com/archives/C02175EGYP2)
- [Tasks Manager](file:///Users/jonathanwilliams/Development/envato/em-automations/task-manager/tasks.jsonl)
```

**Important**:
- Write the full comprehensive summary to OUTPUT.md
- Then respond in conversation with ONLY the Action Required section
- Ensure all links are working and properly formatted
- Group actions by priority (High, Medium, Low)

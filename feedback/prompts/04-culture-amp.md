# Generate Culture Amp Analysis Reports

## Goal
Generate individual Culture Amp 1-on-1 conversation reports for each team member by using Playwright to extract data from their Culture Amp pages. playwright will control a browser that is alreday authenticated with culture amp.

## Team Members with URLs

**Matt Ward** (matt.ward@envato.com)
- URL: `https://envato.cultureamp.com/app/conversations/0190791e-94e3-7187-989b-72f60ea26a80?tab=history`

**Ana Djordjevic** (ana.djordjevic@envato.com)
- URL: `https://envato.cultureamp.com/app/conversations/0190791e-7c48-7571-9773-3c8a7377bc57?tab=history`

**Ai Bate** (ai.bate@envato.com)
- URL: `https://envato.cultureamp.com/app/conversations/0190791e-69f0-7057-939d-8bd02ca7b7b3?tab=history`

**Niko Pax** (niko.pax@envato.com)
- URL: `https://envato.cultureamp.com/app/conversations/0190791e-b169-77f5-9a07-ee0d3b45fe11?tab=history`

**Shannon Ryan** (shannon.ryan@envato.com)
- URL: `https://envato.cultureamp.com/app/conversations/0190791e-ba6b-775c-8893-bdbdd1ef0f44?tab=history`

## Task
For each team member:
1. Navigate to their Culture Amp conversation history page
2. Extract the page content using Playwright and JavaScript
3. Analyze their recent 1-on-1 conversation topics, notes, and actions
4. Look for trends in their engagement, challenges, achievements, and feedback
5. Note any recent updates or completed actions

## Instructions

### Using Playwright MCP Tools:
1. For each person, navigate to their Culture Amp URL (with `?tab=history` parameter)
2. Wait for the page to load completely
3. Execute JavaScript: `document.body.textContent`
4. Extract and parse the text content to find:
   - Recent conversation topics and when they were completed
   - Number of notes per topic
   - Actions completed
   - Chronological conversation history
   - Key topics discussed

### Analysis Points:
- Topics covered in recent conversations
- Frequency of 1-on-1s
- Types of challenges or roadblocks mentioned
- Achievements and wins highlighted
- Action items and their completion status
- Feedback given and received
- Overall engagement level and patterns

### Content Extraction Example:
```javascript
// Navigate to the URL
browser_navigate(url)

// Extract page content
const content = browser_evaluate(() => document.body.textContent)

// Parse and analyze the content
```

## Output Format
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

### Engagement Patterns
- Regularity of conversations
- Depth of discussion (based on notes)
- Level of engagement and participation

### Key Insights
- Notable achievements or wins
- Challenges or roadblocks identified
- Feedback trends
- Growth areas

## Expected Files
- `feedback/dd-mm-yyyy/culture-matt.md`
- `feedback/dd-mm-yyyy/culture-ana.md`
- `feedback/dd-mm-yyyy/culture-ai.md`
- `feedback/dd-mm-yyyy/culture-niko.md`
- `feedback/dd-mm-yyyy/culture-shannon.md`

## Technical Notes
- Use the Playwright MCP browser tools to navigate and extract content
- The History tab provides the most useful data for recent conversations
- Page content includes conversation dates, topics, notes counts, and actions
- Extract text content and parse for structured information


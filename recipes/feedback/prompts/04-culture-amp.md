# Generate Culture Amp Analysis Reports

## Goal
Generate individual Culture Amp 1-on-1 conversation reports for each team member by using Playwright to extract data from their Culture Amp pages. Playwright will control a browser that is already authenticated with Culture Amp.

## Important: Read People Information First
**Before starting**, read the `recipes/people-info.md` file to get Culture Amp URLs and email addresses for all team members.

## Task
For each team member:
1. Navigate to their Culture Amp conversation history page
2. Extract the page content using Playwright and JavaScript
3. Analyze their recent 1-on-1 conversation topics, notes, and actions
4. Look for trends in their engagement, challenges, achievements, and feedback
5. Note any recent updates or completed actions

## Instructions
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


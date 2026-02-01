# Add Topic to Culture Amp Conversation

This recipe adds a new topic to a team member's Culture Amp conversation in the Conversation tab.

## Task

When the user says "Topic [Person Name] [Topic Text]" or "Add this [Jira URL] to my 1:1 with [Person Name]", execute these steps in sequence:

1. **Step 1: Get Team Member Information** (see details below)
2. **Step 2: Format Topic Text** (see details below)
3. **Step 3: Add Topic to Culture Amp** (see details below)

## Context

### Important: Review Context First
**Before starting**:
1. **Read the `files/recipe-config/people-info.md` file** to get information about:
   - Team member details including:
     - Culture Amp URLs
2. **Identify the team member** from the user's request (e.g., "Topic Peter Start Career Map", "Topic Sam Review Q4 Goals", or "Add this https://envato.atlassian.net/browse/IN-398 to my 1:1 with Mark")
3. **Extract the topic text** from the user's request (everything after the person's name, or the URL if provided)

## Step 1: Get Team Member Information

### Goal
Retrieve the team member's Culture Amp conversation URL from the configuration file.

### Instructions
1. Read `files/recipe-config/people-info.md`
2. Locate the team member's section (match by first name, last name, or full name)
3. Extract:
   - **Culture Amp URL** (required - must not be empty)

### Expected Output
- Team member's Culture Amp URL ready for use
- If Culture Amp URL is missing or empty, stop execution and inform the user

## Step 2: Format Topic Text

### Goal
Format the topic text appropriately, especially if it contains a Jira URL.

### Instructions
1. **If the topic contains a Jira URL** (e.g., `https://envato.atlassian.net/browse/IN-398`):
   - Fetch the Jira ticket details using `jira_get_issue` MCP tool
   - Format as: `[IN-398: [Ticket Summary]](https://envato.atlassian.net/browse/IN-398)`
   - Example: `[IN-398: [STOCK VIDEO] Alpha Channels Previews & Preview Experience](https://envato.atlassian.net/browse/IN-398)`
2. **If the topic is plain text**, use it as-is

### Expected Output
- Formatted topic text ready to add to Culture Amp
- Jira tickets formatted in markdown link format matching the template format used in activity reports

## Step 3: Add Topic to Culture Amp

### Goal
Add a new topic to the team member's Culture Amp conversation using browser automation.

### Instructions
**Primary Method: Use cursor-ide-browser MCP tools** (more reliable than local-mcp browser automation):

1. Navigate to the conversation page:
   ```javascript
   browser_navigate({
     url: "{culture_amp_url}?tab=conversation"
   })
   ```

2. Lock the browser tab:
   ```javascript
   browser_lock({})
   ```

3. Take a snapshot to see the page structure:
   ```javascript
   browser_snapshot({})
   ```

4. Find and click the "Add new topic" button (typically ref `e21` or search for button with text "Add new topic")

5. Fill in the topic title field:
   ```javascript
   browser_fill({
     ref: "e211", // Topic title textbox ref
     value: "{formatted_topic_text}"
   })
   ```

6. Click the "Add topic" button:
   ```javascript
   browser_click({
     ref: "e213" // Add topic button ref
   })
   ```

7. Unlock the browser:
   ```javascript
   browser_unlock({})
   ```

**Fallback Method: Use cultureamp_add_topic MCP tool** (if cursor-ide-browser is unavailable):

```javascript
cultureamp_add_topic({
  conversation_url: "https://envato.cultureamp.com/app/conversations/019a25d1-97d6-707b-8c0e-c46015a0b082",
  topic_title: "{formatted_topic_text}",
  waitForIndicators: ["JW", "{person_first_name}", "{person_last_name}"],
  maxWaitTime: 180000,
  headless: false
})
```

### Important Notes
- **Primary method uses cursor-ide-browser**: This is more reliable as it uses your existing browser session
- **You must be logged into Culture Amp**: The browser will use your current session
- The URL automatically includes `?tab=conversation` parameter
- The topic will be added to the Conversation tab's Agenda section
- Element refs may vary - always take a snapshot first to find the correct refs

### Expected Output
- Topic successfully added to the Culture Amp conversation
- Confirmation message with the topic title and conversation URL
- Or an error message if the operation failed

## Example Usage

### Example 1: Adding a plain text topic

To add a topic "Start Career Map" for Peter Lynch:
1. Read `people-info.md` to get Peter's Culture Amp URL:
   - Culture Amp URL: `https://envato.cultureamp.com/app/conversations/019a25d1-97d6-707b-8c0e-c46015a0b082`
2. Navigate and add topic using cursor-ide-browser:
   ```javascript
   browser_navigate({
     url: "https://envato.cultureamp.com/app/conversations/019a25d1-97d6-707b-8c0e-c46015a0b082?tab=conversation"
   })
   browser_lock({})
   browser_snapshot({})
   browser_click({ ref: "e21" }) // Add new topic button
   browser_fill({ ref: "e211", value: "Start Career Map" })
   browser_click({ ref: "e213" }) // Add topic button
   browser_unlock({})
   ```

### Example 2: Adding a Jira ticket (recommended format)

To add Jira ticket IN-398 to Mark Zhou's 1:1:
1. Read `people-info.md` to get Mark's Culture Amp URL:
   - Culture Amp URL: `https://envato.cultureamp.com/app/conversations/019a25d1-91f9-71b8-a878-84e68f14e84b`
2. Fetch Jira ticket details:
   ```javascript
   jira_get_issue({ issue_key: "IN-398" })
   ```
   - Summary: "[STOCK VIDEO] Alpha Channels Previews & Preview Experience"
3. Format the topic: `[IN-398: [STOCK VIDEO] Alpha Channels Previews & Preview Experience](https://envato.atlassian.net/browse/IN-398)`
4. Navigate and add topic:
   ```javascript
   browser_navigate({
     url: "https://envato.cultureamp.com/app/conversations/019a25d1-91f9-71b8-a878-84e68f14e84b?tab=conversation"
   })
   browser_lock({})
   browser_snapshot({})
   browser_click({ ref: "e21" }) // Add new topic button
   browser_fill({
     ref: "e211",
     value: "[IN-398: [STOCK VIDEO] Alpha Channels Previews & Preview Experience](https://envato.atlassian.net/browse/IN-398)"
   })
   browser_click({ ref: "e213" }) // Add topic button
   browser_unlock({})
   ```

## Notes

- The topic is added to the Conversation tab (not History tab)
- The topic appears in the Agenda section of the conversation
- Browser automation requires you to be logged into Culture Amp
- The tool uses browser session state, so you may not need to log in every time if you've used it recently

## Troubleshooting

### Team Member Not Found
- Check the spelling of the name in the user's request
- Verify the team member exists in `people-info.md`
- Try matching by first name, last name, or full name

### Missing Culture Amp URL
- If Culture Amp URL is missing or empty, inform the user that the URL is not configured for this team member
- The operation cannot proceed without a valid Culture Amp URL

### Browser Automation Issues
- **Using cursor-ide-browser**: Make sure you're logged into Culture Amp in your browser - it uses your existing session
- **Using cultureamp_add_topic**: The browser window will open visibly (not headless) so you can see what's happening
- If the page doesn't load, check your internet connection and Culture Amp access
- If the "Add topic" button is not found, take a snapshot first to see the current page structure and find the correct element refs
- Element refs (like `e21`, `e211`, `e213`) may change - always check the snapshot for current refs

### Topic Not Added
- Check the browser console for any errors
- Verify that the topic text was entered correctly
- Make sure the form was submitted successfully
- Check the Culture Amp page manually to verify the topic was added










# Add Topic to Culture Amp Conversation

This recipe adds a new topic to a team member's Culture Amp conversation in the Conversation tab.

## Task

When the user says "Topic [Person Name] [Topic Text]", execute these steps in sequence:

1. **Step 1: Get Team Member Information** (see details below)
2. **Step 2: Add Topic to Culture Amp** (see details below)

## Context

### Important: Review Context First
**Before starting**:
1. **Read the `files/recipe-config/people-info.md` file** to get information about:
   - Team member details including:
     - Culture Amp URLs
2. **Identify the team member** from the user's request (e.g., "Topic Peter Start Career Map" or "Topic Sam Review Q4 Goals")
3. **Extract the topic text** from the user's request (everything after the person's name)

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

## Step 2: Add Topic to Culture Amp

### Goal
Add a new topic to the team member's Culture Amp conversation using browser automation.

### Instructions
1. Use the `cultureamp_add_topic` MCP tool to add the topic
2. The tool will:
   - Navigate to the conversation page with `?tab=conversation` parameter
   - Wait for the page to load (indicator: "JW")
   - Click the "Add new topic" button
   - Enter the topic text in the form
   - Submit the form

### Process
```javascript
cultureamp_add_topic({
  conversation_url: "https://envato.cultureamp.com/app/conversations/019a25d1-97d6-707b-8c0e-c46015a0b082",
  topic_title: "Start Career Map",
  waitForIndicators: ["JW"],
  maxWaitTime: 120000,
  headless: false
})
```

### Important Notes
- The browser window will open (not headless) - make sure you're logged into Culture Amp
- The tool waits for the "JW" indicator to appear, which indicates the page has loaded and you're logged in
- The tool automatically ensures the URL has `?tab=conversation` parameter
- The topic will be added to the Conversation tab's Agenda section

### Expected Output
- Topic successfully added to the Culture Amp conversation
- Confirmation message with the topic title and conversation URL
- Or an error message if the operation failed

## Example Usage

To add a topic "Start Career Map" for Peter Lynch:
1. Read `people-info.md` to get Peter's Culture Amp URL:
   - Culture Amp URL: `https://envato.cultureamp.com/app/conversations/019a25d1-97d6-707b-8c0e-c46015a0b082`
2. Call `cultureamp_add_topic`:
   ```javascript
   cultureamp_add_topic({
     conversation_url: "https://envato.cultureamp.com/app/conversations/019a25d1-97d6-707b-8c0e-c46015a0b082",
     topic_title: "Start Career Map",
     waitForIndicators: ["JW"],
     headless: false
   })
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
- Make sure you're logged into Culture Amp in your browser
- The browser window will open visibly (not headless) so you can see what's happening
- If the page doesn't load, check your internet connection and Culture Amp access
- If the "Add topic" button is not found, the page structure may have changed

### Topic Not Added
- Check the browser console for any errors
- Verify that the topic text was entered correctly
- Make sure the form was submitted successfully
- Check the Culture Amp page manually to verify the topic was added


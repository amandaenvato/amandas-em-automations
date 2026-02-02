# Add Private Note to Culture Amp Conversation

This recipe adds a private note to a team member's Culture Amp conversation in the Personal notes tab.

## Task

When the user says "private note [Person Name] [Note Text]", execute these steps in sequence:

1. **Step 1: Get Team Member Information** (see details below)
2. **Step 2: Add Private Note to Culture Amp** (see details below)

## Context

### Important: Review Context First
**Before starting**:
1. **Read the `files/recipe-config/people-info.md` file** to get information about:
   - Team member details including:
     - Culture Amp URLs
2. **Identify the team member** from the user's request (e.g., "private note Peter Discussed promotion timeline" or "private note Sam Mentioned interest in leadership")
3. **Extract the note text** from the user's request (everything after the person's name)

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

## Step 2: Add Private Note to Culture Amp

### Goal
Add a private note to the team member's Culture Amp conversation using browser automation.

### Instructions
1. Use the `cultureamp_add_private_note` MCP tool to add the note
2. The tool will:
   - Navigate to the conversation page with `?tab=personal_note` parameter
   - Wait for the page to load (indicator: "JW")
   - Find and interact with the personal notes editor
   - Enter the note text
   - Save the note

### Process
```javascript
cultureamp_add_private_note({
  conversation_url: "https://envato.cultureamp.com/app/conversations/019a25d1-97d6-707b-8c0e-c46015a0b082",
  note_text: "Discussed promotion timeline and next steps",
  waitForIndicators: ["JW"],
  maxWaitTime: 120000,
  headless: false
})
```

### Important Notes
- The browser window will open (not headless) - make sure you're logged into Culture Amp
- The tool waits for the "JW" indicator to appear, which indicates the page has loaded and you're logged in
- The tool automatically ensures the URL has `?tab=personal_note` parameter
- The note will be added to the Personal notes tab (private, not visible to the team member)

### Expected Output
- Private note successfully added to the Culture Amp conversation
- Confirmation message with the note text and conversation URL
- Or an error message if the operation failed

## Example Usage

To add a private note "Discussed promotion timeline" for Peter Lynch:
1. Read `people-info.md` to get Peter's Culture Amp URL:
   - Culture Amp URL: `https://envato.cultureamp.com/app/conversations/019a25d1-97d6-707b-8c0e-c46015a0b082`
2. Call `cultureamp_add_private_note`:
   ```javascript
   cultureamp_add_private_note({
     conversation_url: "https://envato.cultureamp.com/app/conversations/019a25d1-97d6-707b-8c0e-c46015a0b082",
     note_text: "Discussed promotion timeline and next steps",
     waitForIndicators: ["JW"],
     headless: false
   })
   ```

## Notes

- The note is added to the Personal notes tab (private, not visible to the team member)
- Personal notes are only visible to you (the manager)
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
- If the notes editor is not found, the page structure may have changed

### Note Not Added
- Check the browser console for any errors
- Verify that the note text was entered correctly
- Make sure the note was saved successfully
- Check the Culture Amp Personal notes tab manually to verify the note was added










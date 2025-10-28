# Check AWS Access Request Notifications

Check for pending AWS access request notifications from the TEAM bot since yesterday morning.

## Instructions

1. Search Slack for messages from the TEAM bot since yesterday morning using `filter_users_from: team`
2. Filter for "AWS Access Request Notification" messages
3. Get the conversation history for the channel with ID `D07N5KT40MT` to see the message contents
4. For each notification found:
   - Construct the Slack link using the format: `https://envato.slack.com/archives/D07N5KT40MT/p[MESSAGE_ID]`
   - Show the timestamp of the request
   - Note that these are interactive notifications requiring approval/denial
5. Give a count of pending AWS access requests

## Important Notes

- The TEAM bot's messages are in channel ID `D07N5KT40MT` (not the user ID from search results)
- When constructing Slack links, use the format: `https://envato.slack.com/archives/D07N5KT40MT/p[msgID]`
- Message IDs from the search results need to be used exactly as they appear
- The message content itself may not be accessible, but the links will allow viewing in Slack

## Expected Output

Provide direct feedback in conversation format with:
- Direct, clickable Slack links to each pending AWS access request notification in the format: `[link text](url)`
- Timestamps of when requests were made
- Total count of pending requests
- Note that these require manual review and approval/denial in Slack

Do not create any documents - just provide the information directly in the conversation.

# Check BambooHR Time Off Requests

Check BambooHR inbox for pending time off approval requests.

## Instructions

1. Use playwright to navigate to the BambooHR inbox at: https://envato.bamboohr.com/inbox/
2. Check if there are any pending time off requests
3. If requests are visible:
   - Provide the request details (employee name, dates, type)
   - Note the status of the request
   - Include a link to view the full request
4. If no requests are present, confirm the "no requests" message
5. Give a count of pending requests

## Important Notes

- This requires navigating to BambooHR using Playwright
- The inbox page will show all pending approval requests
- Look for the "Requests" section on the page
- If you see "You have no more requests!" that means inbox is clear

## Expected Output

Provide direct feedback in conversation format with:
- Count of pending time off requests
- Details for each request (if any)
- Link to view the request in BambooHR
- Confirmation if inbox is clear

Do not create any documents - just provide the information directly in the conversation.
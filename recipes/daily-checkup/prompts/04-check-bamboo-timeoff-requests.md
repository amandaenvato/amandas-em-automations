# Check BambooHR Time Off Requests

Check BambooHR inbox for pending time off approval requests.

## Instructions

1. Use playwright to navigate to the BambooHR inbox at: https://envato.bamboohr.com/inbox/
2. **Authentication Note**: If the page redirects to Okta sign-in, inform the user that they need to sign in manually, and ask them to tell you when they have completed authentication so you can proceed.
3. Once authenticated and the inbox page loads, check if there are any pending time off requests
4. If requests are visible:
   - Provide the request details (employee name, dates, type)
   - Note the status of the request
   - Include a link to view the full request
5. If no requests are present, confirm the "no requests" message
6. Give a count of pending requests

## Important Notes

- This requires navigating to BambooHR using Playwright
- **BambooHR requires Okta authentication** - the page will redirect to a sign-in page if not authenticated
- If you see a sign-in page, inform the user and wait for confirmation that they have signed in before proceeding
- Once authenticated, navigate to the inbox page again
- The inbox page will show all pending approval requests
- Look for the "Requests" section on the page
- If you see "You have no more requests!" or "It's a great day! You have no more requests!" that means inbox is clear

## Expected Output

Provide direct feedback in conversation format with:
- Count of pending time off requests
- Details for each request (if any)
- Link to view the request in BambooHR
- Confirmation if inbox is clear

Do not create any documents - just provide the information directly in the conversation.
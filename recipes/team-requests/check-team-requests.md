# Check Team Requests

Check for pending team approval requests in the TEAM (Temporary Elevated Access Management) system.

## Instructions

1. **Navigate to AWS Access Portal Applications Page**
   - Use Playwright to navigate to: `https://envatoaws.awsapps.com/start/#/?tab=applications`
   - Wait for the page to load completely (approximately 3 seconds)

2. **Click TEAM IDC APP Button**
   - Find and click the "TEAM IDC APP" link/button on the applications page
   - **Important**: This will open a new tab for authentication handshake - you don't need to interact with that tab
   - The authentication handshake happens automatically in the background

3. **Navigate to Approvals Page**
   - Use Playwright to navigate to: `https://team.platform.envato.net/approvals/approve`
   - This page may initially show a "Federated Sign In" message if authentication hasn't completed yet

4. **Wait for Authentication to Complete**
   - If the page shows "Federated Sign In" message, wait 10 seconds, then reload the page
   - Repeat this process (wait 10 seconds, get a snapshot, reload if sign in required) until authentication completes in the background
   - **Stop reloading** when you see either:
     - The authenticated view showing your email address (e.g., "jonathan.williams@envato.com")
     - The approvals table with "Approval Requests (X)" header
     - A message indicating "No approvals to display" or similar
   - **Important**: If the page shows "No approvals to display" after waiting 10 seconds, that means authentication is complete and there are no pending requests - do NOT continue reloading

5. **Check for Pending Approvals**
   - Once authenticated, examine the approvals page for any pending requests
   - Look for:
     - The approval count in the header (e.g., "Approval Requests (0)")
     - The table showing request details (Requester, Account, Role, StartTime, Duration, Justification, TicketNo, Status)
     - Any messages indicating pending approvals

## Important Notes

- **Authentication Handshake**: The TEAM IDC APP button opens a new tab for SAML authentication. This happens automatically - you don't need to interact with that tab.
- **Reload Strategy**: Only reload if the page still shows "Federated Sign In" after waiting 10 seconds. If the page shows authenticated content (your email, approvals table, or "No approvals to display"), stop reloading.
- **Completion Indicator**: The message "No approvals to display" means authentication is complete and there are no pending approvals - the task is done at that point.
- **Don't Approve**: Do not actually approve any requests - just report what's pending and leave the page ready for manual review.

## Expected Output

Provide direct feedback in conversation format with:

- **Authentication Status**: Confirmed when authentication completes
- **Pending Approvals Count**: Number of pending approval requests (if any)
- **Request Details** (if any pending):
  - Requester name
  - Account
  - Role
  - Start time
  - Duration
  - Justification
  - Ticket number
  - Status
- **Page Status**: URL and confirmation that the page is ready for manual review
- **No Approvals Message**: If there are no pending approvals, confirm this clearly

Do not create any documents - provide the information directly in the conversation.

## Example Output Format

```
# Team Requests Check - [DATE]

## Authentication Status
✅ Authentication completed successfully

## Pending Approvals
- **Total Pending**: 0
- **Status**: No pending approval requests

## Page Ready for Review
- **URL**: https://team.platform.envato.net/approvals/approve
- **Status**: Page loaded and ready for manual review (no approvals to display)
```

OR if there are pending approvals:

```
# Team Requests Check - [DATE]

## Authentication Status
✅ Authentication completed successfully

## Pending Approvals
- **Total Pending**: 2

### Request 1
- **Requester**: [Name]
- **Account**: [Account]
- **Role**: [Role]
- **Start Time**: [Date/Time]
- **Duration**: [Duration]
- **Justification**: [Justification text]
- **Ticket Number**: [Ticket #]
- **Status**: Pending

### Request 2
- **Requester**: [Name]
- **Account**: [Account]
- **Role**: [Role]
- **Start Time**: [Date/Time]
- **Duration**: [Duration]
- **Justification**: [Justification text]
- **Ticket Number**: [Ticket #]
- **Status**: Pending

## Page Ready for Review
- **URL**: https://team.platform.envato.net/approvals/approve
- **Status**: Page loaded with 2 pending approvals - ready for manual review and approval
```


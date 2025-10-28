# Daily Checkup - Complete Status Report

Perform all daily checkup tasks in sequence and provide a comprehensive summary.

## Instructions

Execute the following steps in order, following the detailed instructions in each prompt file:

1. **Author Helpline Check** - Follow instructions in `prompts/01-check-author-helpline.md`
2. **Jira Tickets Check** - Follow instructions in `prompts/02-check-jira-tickets.md`
3. **AWS Access Request Check** - Follow instructions in `prompts/03-check-aws-access-requests.md`
4. **BambooHR Time Off Requests Check** - Follow instructions in `prompts/04-check-bamboo-timeoff-requests.md`

## Final Summary Format

After completing all four checks, provide a comprehensive summary:

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

## Overall Status
- **Action Required**: [Summary of what needs attention]
- **Priority Items**: [List any high priority items]

---

Do not create any documents - provide this summary directly in the conversation.

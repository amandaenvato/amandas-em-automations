# Collect Slack Communications

## What This Does
Searches for Slack messages from Jonathan Williams across key channels and organizes them by stakeholder group.

## Who
- **Name**: Jonathan Williams
- **Email**: jonathan.williams@envato.com
- **Role**: Engineering Manager, Author Domain

## Collection Period
Search for messages since the date of the most recent entry in the current Communication Log (typically last 7 days).

## Key Channels to Search

**Company-Wide**: `#env-deployments`, `#shoutouts`, `#envato-delivery-and-projects`
**Leadership**: `#extended-technology-leadership-team`, `#cust-account-mgmt-and-author-leadership`
**Product**: `#author-product-trio`
**Team**: `#author-domain`
**Projects**: `#author-compliance-management-dsa`, `#proj-upload-handover`, `#tmp-salesforce-workato-poc`

## What to Look For

Focus on messages that represent stakeholder communications:
- Sprint reports and updates
- Deployment notices
- Shoutouts and recognition
- Escalations or risks surfaced
- Decisions or decisions needed
- Project updates
- Leadership updates

**Skip**: Casual chat, reactions only, internal team coordination

## For Each Communication Record

1. **Date** (YYYY-MM-DD)
2. **Stakeholder Group** (see mapping below)
3. **Item** (brief summary of what was communicated)
4. **Channel** (Slack channel name)
5. **Link** (permalink to message)
6. **Outcome** (any responses, reactions, or follow-up)

## Stakeholder Group Mapping

Match channels to stakeholder groups:
- **Company-Wide** → Public channels with wide visibility
- **Technology Heads** → Tech leadership channels or DMs to Ray/Nick
- **Domain Leadership** → Domain leadership channels
- **Mark (Direct Manager)** → Direct messages to Mark
- **Author Product Trio** → Product trio channel or DMs
- **Author Team** → Author domain channels
- **Project Stakeholders** → Project-specific channels

## Output Format

Organize all communications by stakeholder group with full details.

**Save as**: `communication-log/dd-mm-yyyy/slack-communications.md`

### File Structure

```markdown
# Slack Communications Analysis

## Summary
- **Period**: [start date] to [end date]
- **Total Communications**: [count]
- **By Stakeholder Group**: [breakdown]

## Communications by Stakeholder Group

### Company-Wide
#### [Date] - [Brief Title]
- **Item**: Sprint report published
- **Channel**: #envato-delivery-and-projects
- **Link**: [permalink]
- **Outcome**: Company-wide visibility. Replies from [names]
- **Context**: [additional details]

### Technology Heads
[Similar format for each entry]

### [Other Groups]
[Organized by stakeholder group]

## Notable Communications
- Escalations surfaced: [list]
- Decisions made: [list]
- Risks identified: [list]
- Recognition given: [list]
```

Include enough detail to create log entries in the next phase.


# Collect Slack Communications

## Goal
Search for Slack messages from the subject person across key channels and organize them by stakeholder group.

## Important: Read People Information First
**Before starting**, read the `people-info.md` file in the workspace root to get information about the subject person (identified in the "Subject Person" section).

## Task
1. Search for messages since the most recent entry in the current Communication Log (typically last 7 days)
2. Asses messages to find stakeholder communications (skip casual chat, reactions only)
3. Organize communications by stakeholder group with full details
4. Extract date, stakeholder group, item, channel, link, and outcome for each communication

## Instructions
- First, read `current-communication-log.md` to identify the key channels from the "Key Channels Identified" section
- Use those channels to guide your Slack search
- Use Slack MCP tools to search for messages from the subject person (get their details from `people-info.md`)
- Search across all of Slack for most recent messages
- Additionally, search specifically in the channels identified from the Communication Log

**Focus on messages that represent stakeholder communications:**
- Sprint reports and updates
- Deployment notices
- Shoutouts and recognition
- Escalations or risks surfaced
- Decisions or decisions needed
- Project updates
- Leadership updates

**For each communication record:**
1. **Date** (YYYY-MM-DD)
2. **Stakeholder Group** - match channels to stakeholder groups:
   - **Company-Wide** → Public channels with wide visibility
   - **Technology Heads** → Tech leadership channels or DMs to Ray/Nick
   - **Domain Leadership** → Domain leadership channels
   - **Mark (Direct Manager)** → Direct messages to Mark
   - **Author Product Trio** → Product trio channel or DMs
   - **Author Team** → Author domain channels
   - **Project Stakeholders** → Project-specific channels
3. **Item** (brief summary of what was communicated)
4. **Channel** (Slack channel name)
5. **Link** (permalink to message)
6. **Outcome** (any responses, reactions, or follow-up)

## Expected Output

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


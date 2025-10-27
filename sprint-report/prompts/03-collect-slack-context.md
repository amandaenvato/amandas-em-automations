# Collect Slack Context for Sprint

## Goal
Gather relevant Slack discussions from the sprint period to add context to the report.

## Important: Read Sprint Details First
**Before starting**, read `draft-analysis.md` to get the sprint dates.

## Task

Search for Slack activity during the sprint period (from sprint start to end date):

1. Search key channels for activity
2. Look for relevant discussions about sprint work
3. Collect context about:
   - Deployments and releases
   - Blockers and escalations
   - Team discussions about work
   - Decisions made
   - Shoutouts or achievements

## Channels to Search

### Required Channels
- `#author-domain` - Main team channel
- `#author-helpline` - Support and escalations
- `#author-compliance-management-dsa` - Project context

### Additional Channels (if relevant)
- `#env-deployments` - Deployment notices
- `#author-product-trio` - Product coordination
- `#author-verification-compliance` - If related to verification work
- Other channels mentioned in work items

## What to Look For

### Deployment Announcements
- "Deployed [feature] to production"
- "Rolling out [change] to [audience]"
- Links to relevant PRs or deployments

### Escalations and Blockers
- Issues that came up during the sprint
- How they were resolved
- Team coordination efforts

### Team Discussions
- Technical discussions about implementation
- Decisions about approaches
- Problem-solving conversations

### Achievements
- Shoutouts or recognition
- Positive feedback from stakeholders
- Success stories

## Search Strategy

1. Use `conversations_search_messages` to search each channel
   - Format channel names with `#` prefix (e.g., `#author-domain`)
   - Use `filter_date_after` and `filter_date_before` to set exact date range
   - Start with limit=100 to get comprehensive results
2. Filter by date range (sprint start to end date)
3. Look for messages from Author team members
4. Focus on messages related to work items mentioned in the draft

**Important Notes**:
- Channel names MUST include `#` prefix
- Date format should be YYYY-MM-DD
- Search results return message objects with timestamp, user info, and text
- Use the results to understand: deployments, blockers, discussions, achievements

## Output Format

Save as `sprint-report/dd-mm-yyyy/slack-context.md`:

```markdown
# Slack Context for Sprint [dates]

## Summary
- **Total relevant messages found**: [count]
- **Key themes**: [themes]

## Deployments and Releases
### [Date] - [Feature/Change]
- **Channel**: #[channel]
- **Message**: [quote or summary]
- **Link**: [permalink]
- **Context**: [why this matters for the sprint report]

## Escalations and Blockers
### [Date] - [Issue]
- **Channel**: #[channel]
- **Problem**: [summary]
- **Resolution**: [how it was handled]
- **Link**: [permalink]

## Team Discussions
### [Date] - [Topic]
- **Channel**: #[channel]
- **Discussion**: [summary of key points]
- **Decision/Outcome**: [what was decided]
- **Link**: [permalink]

## Achievements and Recognition
### [Date] - [Achievement]
- **Channel**: #[channel]
- **Message**: [quote or summary]
- **Link**: [permalink]
```

## Expected Output

- File: `sprint-report/dd-mm-yyyy/slack-context.md`
- Relevant Slack messages from the sprint period
- Organized by theme (deployments, blockers, discussions, achievements)
- Provides context for improving the draft report


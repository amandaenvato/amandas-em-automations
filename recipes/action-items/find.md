# Find Action Items Recipe

This recipe explains how to find pending action items where a user has been directly pinged or assigned in Slack and emails.

## Overview

The goal is to identify specific pending actions where the user has been directly mentioned (e.g., `@username`) or assigned tasks, focusing on recent items (last 2 days by default).

## Step-by-Step Process

### 1. Search Slack for Direct Mentions

Use the Slack search tool to find all messages mentioning the user's handle:

```bash
mcp_slack-mcp-server_conversations_search_messages
```

**Key Parameters:**
- `search_query`: Use `@username` (e.g., `@jdub`)
- `limit`: Set to 100 for comprehensive coverage
- `filter_date_after`: Use date format `YYYY-MM-DD` to limit to recent results (e.g., `2025-10-26` for last 2 days)

**Best Practices:**
- Start with a broad search using just `@username` to catch all mentions
- Use `filter_date_after` to focus on recent items
- Search for action-oriented keywords like `@username action`, `@username task`, `@username please`, `@username need`, `@username help`, `@username follow up`

### 2. Search Emails for Google Docs/Sheets Assignments

Use the Gmail search tool to find assignment notifications:

```bash
mcp_gmail_search_emails
```

**Key Parameters:**
- `query`: Use specific queries like:
  - `from:comments-noreply@docs.google.com "assigned you an action"`
  - `from:comments-noreply@docs.google.com "assigned you"`
  - `from:comments-noreply@docs.google.com "action item"`
- `maxResults`: Set to 10-20 for focused results

### 3. Read Specific Emails for Details

For emails that contain assignments, read them to extract specific action details:

```bash
mcp_gmail_read_email
```

**Key Parameters:**
- `messageId`: Use the message ID from search results

### 4. Get Channel Information for Correct Links

To create proper Slack links, get channel information:

```bash
mcp_slack-mcp-server_channels_list
```

**Key Parameters:**
- `channel_types`: Use `public_channel,private_channel,im,mpim` for comprehensive coverage
- `limit`: Set to 1000 to get all channels

## Output Format

**Always output results in Markdown format directly in the chat response** (not in a new file). Include:

1. **Action Title** (bold)
2. **Date**
3. **Source** with clickable link to Slack channel or email
4. **Action** description
5. **Due Date** (if specified)
6. **Context** (additional details)

**Link Format Examples:**
- Slack: `[#channel-name](https://envato.enterprise.slack.com/archives/CHANNEL_ID)`
- Email: `[Email Subject](mailto:recipient@domain.com)`
- Documents: `[Document Name](https://docs.google.com/document/d/DOC_ID)`

## Key Learnings

### Slack Search Optimization
- Use `@username` as the primary search term
- Combine with action words: `@username action`, `@username task`, `@username please`
- Use `filter_date_after` to focus on recent items
- Set `limit` to 100 for comprehensive coverage
- Search multiple variations to catch different phrasings

### Email Search Patterns
- Focus on `comments-noreply@docs.google.com` for Google Docs assignments
- Use specific phrases like "assigned you an action" or "action item"
- Read individual emails to extract detailed action requirements

### Link Generation
- Always use `envato.enterprise.slack.com` domain for Slack links
- Include channel ID in the URL format: `/archives/CHANNEL_ID`
- Make links clickable by using proper Markdown syntax

### Filtering Strategy
- Focus on recent items (last 2 days) unless specifically asked for longer timeframe
- Look for direct assignments, not general mentions
- Prioritize items with specific action requirements over general discussions

## Example Output Structure

```markdown
## Recent Pending Actions (Last 2 Days)

### 1. **Action Title**
**Date**: YYYY-MM-DD
**Source**: [#channel-name](https://envato.enterprise.slack.com/archives/CHANNEL_ID) - **@username** mentioned
**Action**: Specific action required
**Due Date**: YYYY-MM-DD (if specified)
**Context**: Additional details
```

## Common Pitfalls to Avoid

1. **Incorrect Slack Links**: Always use `envato.enterprise.slack.com` not `envato.slack.com`
2. **Missing Channel IDs**: Get channel list to find correct IDs for links
3. **Too Broad Results**: Use date filters and specific search terms
4. **Missing Context**: Read individual emails/messages for full action details
5. **Output Format**: Always use Markdown in chat response, not separate files

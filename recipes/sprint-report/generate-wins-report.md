# Generate Sprint Wins Report

This recipe generates a wins report from Jira tickets and Slack threads, formatted with catchy titles and references.

## Task

When the user says "Sprint Report" and provides source information (Jira ticket keys and/or Slack thread URLs), execute these steps in sequence:

1. **Step 1: Extract Source Information** (see details below)
2. **Step 2: Ask for Confluence Report Link** (see details below)
3. **Step 3: Fetch Information from Sources** (see details below)
4. **Step 4: Generate Wins Report** (see details below)
5. **Step 5: Create Slack Message** (see details below)

## Context

### Input Format

The user will provide:
- **Jira ticket keys** (e.g., "IN-383", "IN-405", or comma-separated list)
- **Slack thread URLs** (e.g., "https://envato.slack.com/archives/C08J8RBJKL4/p1768883489874079")
- **Confluence report link** (optional - if not provided, ask for it)
- Or both

### Output Location

All output goes into `files/output/sprint-report-dd-mm-yyyy/`:
- `OUTPUT.md` - Final wins report with catchy titles and references
- `slack-message.txt` - Slack message template ready to post

**Date format**: Use today's date in `dd-mm-yyyy` format (e.g., `02-02-2026`)

## Step 1: Extract Source Information

### Goal
Extract Jira ticket keys and Slack thread URLs from the user's input.

### Instructions

1. **Parse Jira Tickets**
   - Look for patterns like `IN-XXX`, `ATH-XXX`, `PROJ-XXX` (any project key followed by dash and number)
   - Extract all ticket keys mentioned
   - Handle comma-separated lists (e.g., "IN-383, IN-405")

2. **Parse Slack URLs**
   - Look for URLs matching pattern: `https://envato.slack.com/archives/C08J8RBJKL4/p1768883489874079`
   - Extract the full URL
   - Extract channel ID (e.g., `C08J8RBJKL4`) and thread timestamp (e.g., `1768883489.874079`)

3. **Validate Input**
   - Ensure at least one source is provided (either Jira tickets or Slack threads)
   - If no sources found, ask user to provide ticket keys or Slack URLs

### Expected Output

- List of Jira ticket keys to fetch (e.g., `["IN-383", "IN-405"]`)
- List of Slack thread URLs with channel IDs and timestamps (e.g., `[{url: "...", channel_id: "C08J8RBJKL4", thread_ts: "1768883489.874079"}]`)

## Step 2: Ask for Confluence Report Link

### Goal
Ensure we have the Confluence report link for the Slack message.

### Instructions

1. **Check if link provided**
   - Look for Confluence URLs in the user's input (e.g., `https://envato.atlassian.net/wiki/spaces/...`)
   - If found, extract and store it

2. **Ask if missing**
   - If no Confluence link is found in the user's input, ask: "Please provide the link to the Confluence report."
   - Wait for the user to provide the link
   - Store the link for use in Step 5

### Expected Output

- Confluence report URL (e.g., `https://envato.atlassian.net/wiki/spaces/.../pages/...`)
- If not provided initially, ask user and wait for response

## Step 3: Fetch Information from Sources

### Goal
Retrieve detailed information from Jira tickets and Slack threads.

### Instructions

#### Fetch Jira Tickets

For each Jira ticket key:

1. Use `jira_get_issue` MCP tool with:
   - `issue_key`: The ticket key (e.g., "IN-383")
   - `fields`: "*all" to get all fields
   - `comment_limit`: 20 (to get recent comments with updates)

2. Extract key information:
   - **Summary**: Issue summary/title
   - **Status**: Current status (e.g., "Released", "Done")
   - **Description**: Full description
   - **Comments**: Recent comments (especially completion updates)
   - **Resolution date**: When it was completed
   - **Assignee**: Who worked on it
   - **Labels**: Any relevant labels

3. Look for completion updates in comments:
   - Comments that mention "completed", "finished", "done"
   - Comments with metrics or numbers
   - Comments with achievement details

#### Fetch Slack Threads

For each Slack thread URL:

1. Extract channel ID and thread timestamp from URL:
   - Channel ID: The part after `/archives/` and before `/p` (e.g., `C08J8RBJKL4`)
   - Thread timestamp: The part after `/p` (e.g., `1768883489874079`)
   - Convert timestamp format: `1768883489874079` → `1768883489.874079` (add decimal point)

2. Use `conversations_replies` MCP tool with:
   - `channel_id`: The channel ID (with or without `#` prefix)
   - `thread_ts`: The thread timestamp in format `1234567890.123456`

3. Extract key information:
   - **Main message**: The first message in the thread (usually contains the achievement)
   - **Replies**: Additional context from replies
   - **Reactions**: Any reactions (to gauge importance)
   - **Author**: Who posted the update

### Expected Output

- Structured data for each source:
  - Jira tickets: Summary, status, key achievements, metrics, completion details
  - Slack threads: Main message content, key achievements, metrics mentioned

## Step 4: Generate Wins Report

### Goal
Create a formatted wins report in the release-announcement style: emoji + headline, narrative paragraph(s), optional metrics, reference line, and status.

### Instructions

1. **Analyze Information**
   - Review all fetched information
   - Identify key achievements and wins
   - Extract metrics and numbers (coverage %, counts, batches, days, incidents)
   - Note completion status (e.g. Released, Done)

2. **Create Headlines**
   - Each win gets a short, outcome-focused headline with an emoji
   - Use celebration emojis: 🎉, 🚀, ✨, 🎊, 🎯, 💪, 🔥, ⚡, 🌟, 🏆
   - Headlines should be concise and state what is now available or done
   - Examples:
     - "🎉 Photos uplifted stylistic and technical metadata available for downstream systems"
     - "🚀 3D Previews live on the App for the majority of the 3D catalogue"

3. **Write Narrative Paragraph**
   - Start with "Previously" or similar context when it fits
   - Explain what was done and why it matters (e.g. "made available for downstream systems", "ready to be consumed by the New App (and Elements)")
   - Keep to 1–2 sentences for the main narrative

4. **Add Metrics Paragraph (when available)**
   - If the source has concrete numbers, add a sentence: coverage %, counts, batches, days, "zero incidents"
   - Example: "Photos metadata backfill completed with 99.4% coverage - 14,823,862 photos with metadata out of 14,906,644 total distributable photos, processed across 11 batches over 8 days with zero incidents."
   - Omit this sentence if no such metrics exist

5. **Add Reference Line**
   - Format: `Reference: KEY: Full Jira issue summary/title`
   - Example: `Reference: IN-383: Expose Uplifted Metadata for Photos & Presentation Templates Downstream`
   - Use the exact Jira summary from the ticket. Optionally append a markdown link: `Reference: [IN-383: Expose Uplifted Metadata for Photos & Presentation Templates Downstream](https://envato.atlassian.net/browse/IN-383)`

6. **Add Status**
   - On its own line after the reference, output the Jira status (e.g. `Released`, `Done`)

7. **Format Output**
   - Each win is one block: headline - narrative. [Optional metrics sentence]. Reference: KEY: Full title. Then status on the next line.
   - Separate multiple wins with a blank line.

### Output Format

Save as `files/output/sprint-report-dd-mm-yyyy/OUTPUT.md`.

**Structure for each win:**

```
🎉 [Headline] - [Narrative paragraph explaining what was done and impact, e.g. made available for downstream / ready for New App]. [Optional: metrics sentence - coverage %, counts, batches, days, zero incidents.] Reference: IN-XXX: [Full Jira issue summary]
Released
```

**Full example (single win):**

```markdown
🎉 Photos uplifted stylistic and technical metadata available for downstream systems - Previously uplifted stylistic and technical metadata for our over 15.4 million photos has been made available for downstream systems and is now ready to be consumed by the New App (and Elements). Photos metadata backfill completed with 99.4% coverage - 14,823,862 photos with metadata out of 14,906,644 total distributable photos, processed across 11 batches over 8 days with zero incidents. Reference: IN-383: Expose Uplifted Metadata for Photos & Presentation Templates Downstream
Released
```

**Multiple wins:** use the same structure for each win, separated by a blank line. No bullet list or "## Wins" header—plain blocks only.

### Writing Guidelines

**For Headlines:**
- Outcome-focused: what is now available or done
- Concise (roughly 5–12 words)
- Use one celebration emoji at the start

**For Narrative:**
- Context first if it helps ("Previously uplifted...", "We've completed...")
- Clearly state availability/consumption (downstream, New App, Elements)
- One or two sentences

**For Metrics (optional):**
- Include when you have: coverage %, totals, batches, duration, incidents
- One sentence; omit if no metrics

**For Reference:**
- Always: `Reference: KEY: Full Jira summary` (use exact summary from Jira)
- Optionally add markdown link to the Jira browse URL

**For Status:**
- Single word/phrase on its own line (e.g. `Released`, `Done`)

### Expected Output

- File: `files/output/sprint-report-dd-mm-yyyy/OUTPUT.md`
- Format: Release-announcement style blocks (headline - narrative. metrics. Reference: KEY: Title → status)
- Content: All wins from provided sources, formatted consistently
- Quality: Clear, informative, with metrics when available

## Step 5: Create Slack Message

### Goal
Create a Slack message template for posting to Slack (but do NOT post automatically).

### Instructions

1. **After generating wins report**, create a Slack message with the following exact format:

```
Sprint Report:
<Confluence report link>
Please review, and alter as you please! Don't forget to hit publish after editing. The report will be automatically published tomorrow in the slack channel at 3PM
cc: @angie.swart @cameron.picton @Sarah.Harris @Sarah McC
```

2. **Save the message** to `files/output/sprint-report-dd-mm-yyyy/slack-message.txt`

3. **Display the message** to the user along with the wins report

4. **Important**: Do NOT post to Slack automatically. Only post when the user explicitly says "post to slack" or similar command.

### When User Requests to Post to Slack

When the user explicitly asks to post to Slack (e.g., "post to slack", "send to slack", "post it"):

1. **Read the saved Slack message** from `files/output/sprint-report-dd-mm-yyyy/slack-message.txt`

2. **Post ONLY the Slack message** (not the wins report content)

3. **Determine the channel**:
   - Ask user which channel to post to, OR
   - Use a default channel if specified in the recipe context

4. **Use `conversations_add_message` MCP tool** to post the message

5. **Confirm posting** with the user

### Expected Output

- File: `files/output/sprint-report-dd-mm-yyyy/slack-message.txt` with the Slack message template
- Message displayed to user for review
- Message ready to post when user requests it

## Example Usage

**User says:** "Sprint Report - IN-383, IN-405, and https://envato.slack.com/archives/C08J8RBJKL4/p1768883489874079"

**Process:**
1. Extract: Jira tickets `["IN-383", "IN-405"]` and Slack thread `{url: "...", channel_id: "C08J8RBJKL4", thread_ts: "1768883489.874079"}`
2. Fetch details from all three sources
3. Generate wins report with catchy titles and references

**Output:** 
- `files/output/sprint-report-02-02-2026/OUTPUT.md` with formatted wins report
- `files/output/sprint-report-02-02-2026/slack-message.txt` with Slack message template
- Wins report displayed to user
- Slack message displayed to user (but NOT posted automatically)

## Error Handling

### Missing Sources
- If no Jira tickets or Slack URLs found, ask user to provide them
- Suggest format: "Sprint Report - IN-XXX, IN-YYY, https://envato.slack.com/..."

### Jira API Failures
- If ticket not found, note it in the report or skip it
- If API rate limited, wait and retry
- If ticket exists but has no completion info, use available information

### Slack API Failures
- If thread not found, skip it
- If channel ID incorrect, try with/without `#` prefix
- If timestamp format wrong, try different formats

### Partial Information
- If some sources fail, proceed with available information
- Note in report if information is incomplete
- Still generate report with what's available

## Notes

- **Date format**: Always use `dd-mm-yyyy` format for directory names
- **Emoji variety**: Use different celebration emojis for each win
- **Metrics**: Always include specific numbers when available
- **References**: Always include links to original sources
- **Consistency**: Follow the same format for all wins
- **Slack posting**: NEVER post to Slack automatically. Only post when user explicitly requests it (e.g., "post to slack", "send to slack")
- **Slack message content**: When posting, post ONLY the Slack message template, NOT the wins report content

## Troubleshooting

### No Wins Found
- Check if tickets are actually completed (status = "Done" or "Released")
- Look for completion comments in Jira
- Check Slack threads for achievement announcements

### Vague Descriptions
- Look for metrics in comments (numbers, percentages, counts)
- Check resolution dates for completion timing
- Review descriptions for business value statements

### Missing References
- Always include at least one reference per win
- If multiple sources mention same win, include all references
- Format references consistently

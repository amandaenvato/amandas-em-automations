# Collect Feedback Information

This prompt coordinates the **information collection** phase for generating team feedback reports.

## Task

Run these prompts in sequence:

1. Execute `prompts/01-current-doc.md` to get the current feedback document
2. Execute `prompts/02-slack-analysis.md` to collect Slack activity for each team member
3. Execute `prompts/03-jira-analysis.md` to collect Jira work for each team member
4. Execute `prompts/04-culture-amp.md` to collect Culture Amp 1-on-1 data for each team member

If for whatever reason the task cannot be completed, explain the issue and ask if the user wants to retry those failures.

## Output Structure

All output goes into `feedback/dd-mm-yyyy/`:
- `current-doc.md` - Current feedback document from Google Drive
- `slack-{firstname}.md` - Slack activity analysis for each team member (5 files)
- `jira-{firstname}.md` - Jira work analysis for each team member (5 files)
- `culture-{firstname}.md` - Culture Amp conversation analysis for each team member (5 files)

## Context

### Target Document
- File ID: `1JRQS1rBc7XmNJkt28ZvKFB4oIY239vyv5HaOaGwjhiY`
- Document: "Feedback To Reports"
- Contains: Historical feedback entries for each team member

### Important: Read People Information First
**Before starting**, read the `recipes/people-info.md` file to get information about:
- Manager information (Jonathan Williams)
- Team member details (Matt, Ana, Ai, Niko, Shannon) including:
  - Email addresses
  - Slack IDs
  - Jira account IDs
  - Culture Amp URLs

## How It Works

### Step 1: Get Current Feedback Document
Read the existing feedback document to determine:
- The last feedback entry date for each team member
- The format and structure of existing entries
- Areas of focus in recent feedback

### Step 2: Collect Slack Activity
Search for each team member's messages and analyze:
- Communication patterns and frequency
- Technical contributions and discussions
- Collaboration and engagement
- Notable achievements or concerns

Search period: **Last 7 days** or since their last feedback entry.

Key channels to analyze:
- Team channels: `#author-domain`
- Cross-team: `#author-product-trio`
- Leadership: `#author-leadership`
- Deployments: `#env-deployments`
- Any channels where they actively contribute

### Step 3: Collect Jira Work Activity
Search for completed work assigned to each team member in the ATH project:
- Types of work (features, bugs, improvements)
- Work complexity and impact
- Velocity and consistency
- Technical approach and solutions

Search period: Work completed in **last 7 days** or since their last feedback entry.

### Step 4: Collect Culture Amp 1-on-1 Data
Extract recent 1-on-1 conversation history for each team member:
- Conversation topics discussed
- Frequency and regularity of meetings
- Notes and insights shared
- Action items and their status
- Engagement patterns and participation

## Types of Information to Capture

### Communication & Collaboration
- Frequency and quality of Slack communication
- Participation in team discussions
- Knowledge sharing and mentoring
- Cross-team collaboration

### Technical Contributions
- Code quality and approach
- Problem-solving skills
- Technical decision-making
- Innovation and improvements

### Work Delivery
- Velocity and consistency
- Work complexity handled
- Delivery quality
- Project impact

### Professional Growth
- Skill development
- Areas of interest
- Challenges faced
- Feedback given and received

### Engagement
- Participation in 1-on-1s
- Engagement in conversations
- Proactive communication
- Team contribution

## Timeline

Default collection period: **7 days** or since the last feedback entry for each team member.

The current document provides the baseline date for each person's last entry, and the collection should focus on activity since that date.
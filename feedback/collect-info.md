# Collect Feedback Information

This prompt coordinates the **information collection** phase for generating team feedback reports.

## Task

Run these prompts in sequence:

1. Execute `prompts/01-current-doc.md` to get the current feedback document
2. Execute `prompts/02-slack-analysis.md` to collect Slack activity for each team member
3. Execute `prompts/03-jira-analysis.md` to collect Jira work for each team member
4. Execute `prompts/04-culture-amp.md` to collect Culture Amp 1-on-1 data for each team member

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

### Manager Information
- **Name**: Jonathan Williams
- **Email**: jonathan.williams@envato.com
- **Role**: Engineering Manager, Author Domain
- **Team**: Author Domain Engineering

### Team Members
1. **Matt Ward** (matt.ward@envato.com)
   - Slack ID: `U04UDLK8ZB8`
   - Jira account_id: `557058:78cd7ea5-4b4e-47b9-9090-be983700bf1e`

2. **Ana Djordjevic** (ana.djordjevic@envato.com)
   - Slack ID: `U5Z91JNS0`
   - Jira account_id: `557058:c623601d-9856-44f0-8c27-007ae131cb73`

3. **Ai Bate** (ai.bate@envato.com)
   - Slack ID: `U042DMWMLM6`
   - Jira account_id: `631fcc634395a525a710a793`

4. **Niko Pax** (niko.pax@envato.com)
   - Slack ID: `U02869QFPEY`
   - Jira account_id: `60f4c3e78b1a9b006fc59ca9`

5. **Shannon Ryan** (shannon.ryan@envato.com)
   - Slack ID: `UCZ4EM06B`
   - Jira account_id: `5bb702302d188519e0dbe3df`

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
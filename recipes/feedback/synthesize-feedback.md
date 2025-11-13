# Synthesize Feedback Entry

## Goal
Generate a new feedback entry by synthesizing information from collected analysis files and adding it to the feedback document format.

## Input Files

Read all files from the most recent date-stamped directory in `files/output/` matching `feedback-*` (e.g., `files/output/feedback-27-10-2025/`):

### Required Files for Each Team Member:
- `current-doc.md` - Current state of the feedback document
- `slack-{person}.md` - Slack activity analysis
- `jira-{person}.md` - Jira work activity analysis
- `culture-{person}.md` - Culture Amp conversation analysis

Where `{person}` is: matt, ana, ai, niko, shannon

## Team Members

Generate feedback for:
- Matt Ward
- Ana Djordjevic
- Ai Bate
- Niko Pax
- Shannon Ryan

## Context

Before synthesizing, review the em-knowledgebase to understand:
- Team health signals and patterns to recognize
- What types of contributions demonstrate value and growth
- Communication and collaboration indicators
- Performance patterns and engagement signals
- How to provide balanced, actionable feedback

## Task

Read all the collected analysis files and synthesize a new feedback entry in the exact format used in the current document.

If for whatever reason the task cannot be completed, explain the issue and ask if the user wants to retry those failures.

### For Each Team Member, Synthesize:

**Expectations**
- Review the last entry in `current-doc.md` for current expectations
- Update if new expectations have emerged from recent work
- Keep focused on specific, measurable goals

**Trajectory**
- Review the growth trajectory from previous entries
- Look for evidence of progress toward trajectory goals
- Identify what behaviours are helping or hindering growth

**Behaviours**
Patterns of behaviour synthesized from all sources (Slack, Jira, Culture Amp):
- **Focus on the most pertinent areas only** - this is NOT a comprehensive log
- **Prioritize concerning examples** - behaviors that raise concerns or signal issues
- **Prioritize excellent examples** - standout performance that demonstrates growth or exceeds expectations
- Communication and collaboration patterns (only if notable)
- Initiative and leadership demonstrated (only if notable)
- Specific examples that illustrate trajectory progress or concerns
- Recent work that has significant impact or demonstrates key behaviors
- Problem-solving approaches (only if exceptional or concerning)
- Do not list routine work unless it demonstrates something important about role expectations or trajectory.

**Outcomes**
- Compare current behaviours against previous feedback given
- Note any changes or improvements observed
- Highlight areas where feedback was acted upon

**Feedback Ideas**
Generate 3-4 actionable bullet points covering:
- Recognition of strengths and specific achievements
- Specific growth areas tied to their trajectory
- Actionable suggestions for improvement
- Strategic feedback for career development

**Feedback Given**
- Document what feedback was actually given in Slack conversations or Culture Amp notes since the last feedback entry
- Include specific dates and sources (e.g., "Nov 6, 2025 (Culture Amp): ..." or "Nov 10, 2025 (Slack): ...")
- Capture recognition, acknowledgments, or explicit feedback given during 1-on-1s, check-ins, or team conversations
- If no feedback was given during this period, note "No explicit feedback documented in Culture Amp or Slack for this period"

## Output Format

Generate a new entry section in this exact format:

```markdown
### [Today's Date in format: Mmm DD, YYYY]

* **Matt Ward**
  * Expectations:
    * [List of current expectations, carried forward or updated]
  * Trajectory:
    * [Growth trajectory and what would help]
  * Behaviours:
    * [Synthesized behaviours from all sources]
    * [Specific examples and patterns]
    * [Communication and collaboration notes]
    * [Recent accomplishments and work]
  * Outcomes:
    * [Observed changes from previous feedback]
  * **Feedback ideas:**
    * [Actionable feedback suggestion 1]
    * [Actionable feedback suggestion 2]
    * [Actionable feedback suggestion 3]
  * **Feedback given:**
    * [Document what feedback was actually given in Slack or Culture Amp since last feedback entry, with dates and sources]

* **Ana Djordjevic**
  * Expectations:
    * [...]
  * Trajectory:
    * [...]
  * Behaviours:
    * [...]
  * Outcomes:
    * [...]
  * **Feedback ideas:**
    * [...]
  * **Feedback given:**
    * [leave blank]

[... repeat for Niko, Ai, Shannon]
```

## Instructions

1. Identify the most recent `files/output/feedback-dd-mm-yyyy/` directory
2. Read all the analysis files in that directory
3. Read `current-doc.md` to understand previous context
4. For each team member, synthesize their information across all sources
5. Generate the new entry in the exact format shown above
6. Save the output as `files/output/feedback-dd-mm-yyyy/OUTPUT.md` (using the same date as the source directory)
7. Include ONLY the new entry section (the date header and content)

## Synthesis Guidelines

### Expectations
- Start with expectations from the most recent previous entry
- Update if context has changed based on recent work
- Keep expectations specific and measurable

### Trajectory
- Carry forward trajectory from last entry unless there's a strong reason to update
- Focus on growth areas and behaviours that help/hinder

### Behaviours
**IMPORTANT: This section should NOT be comprehensive. Focus only on the most pertinent behaviors.**

Look for patterns across sources:
- **From Slack**: Communication patterns (only if notable - concerning or excellent)
- **From Jira**: Work that demonstrates trajectory progress, concerning patterns, or exceptional performance
- **From Culture Amp**: Concerning trends, excellent engagement, or notable action completion

**Selection criteria for behaviors:**
- Does this demonstrate progress toward trajectory goals?
- Is this a concerning pattern that needs attention?
- Is this an excellent example of performance against role expectations?
- Does this illustrate a strength or weakness relevant to feedback?

Be specific with examples, dates, and numbers, but only include the most relevant ones.

### Outcomes
- Note observable changes from previous feedback
- Highlight improvements or continued challenges
- Connect to specific behaviours identified in previous sessions

### Feedback Ideas
Make it:
- **Actionable**: Specific behaviours to reinforce or change
- **Relevant**: Tied to expectations and trajectory
- **Concrete**: With examples and next steps
- **Balanced**: Recognition + growth areas

### Feedback Given
**Important:** This section documents what feedback was actually given, not what should be given.

- Review Culture Amp notes for completed feedback topics, check-ins, and recognition
- Review Slack conversations for explicit feedback, shoutouts, or acknowledgments
- Include specific dates and sources (e.g., "Nov 6, 2025 (Culture Amp): ...")
- Document recognition, acknowledgments, or explicit feedback given during 1-on-1s, check-ins, or team conversations
- If no feedback was given during this period, note "No explicit feedback documented in Culture Amp or Slack for this period"
- This captures what was actually communicated to the team member, not what should be communicated

## Expected Output

- File: `files/output/feedback-dd-mm-yyyy/OUTPUT.md` (where dd-mm-yyyy matches the source directory)
- Format: Matches the entry structure from current-doc.md
- Content: New entry for today's date with synthesized information for all 5 team members
- Sections: Complete for Matt, Ana, Niko, Ai, and Shannon

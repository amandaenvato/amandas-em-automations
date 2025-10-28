# Synthesize Improved Sprint Report

## Goal
Generate an improved draft sprint report that is more comprehensive, executive-friendly, and follows the template format.

## Input Files

Read all files from the most recent date-stamped directory in `sprint-report/`:

- `draft-analysis.md` - Analysis of current draft
- `jira-work.md` - Detailed work items from Jira
- `slack-context.md` - Slack discussions and context

## Task

Generate a new sprint report that:

1. **Follows the Template Format**
   - Clear header with dates
   - Sprint Goal section
   - Wins section (grouped by initiative/project)
   - Challenges and risks section
   - Additional Notes section
   - Metrics placeholders

2. **Is Executive-Friendly and Accessible**
   - Focuses on business value and outcomes
   - Uses simple, direct language (as if audience has English as second language)
   - Short sentences. Simple words. Direct statements.
   - No jargon unless necessary. Explain technical terms when used.
   - Highlights impact on authors, support, compliance
   - Clear and concise

3. **Provides Better Context**
   - Groups wins logically by project area
   - Explains why work matters (business context)
   - Shows relationships between work items
   - Highlights key accomplishments

4. **Improves Clarity**
   - Clear section headers
   - Consistent formatting
   - Well-organized content
   - Appropriate level of detail

## Writing Principles

**CRITICAL: Write for non-native English speakers**
- Use short sentences (10-15 words max)
- Use simple words (avoid: mitigate, leverage, facilitate, optimize)
- Say things directly ("We did X" not "X was facilitated")
- Use active voice ("System blocks author" not "Author is blocked")
- Avoid contractions ("do not" not "don't" in formal sections)
- Explain acronyms first time (Author Platform (AP))
- Use plain present tense ("We lock" not "System enables locking")
- Be literal, not metaphorical ("System stops author" not "System prevents author journey")

**CRITICAL: Be brief**
- Only include major accomplishments (omit minor tasks)
- Maximum 5-7 wins (not every ticket)
- Maximum 2-3 challenges
- Maximum 3-4 additional notes
- Metrics: 1 sentence per metric
- Goal explanation: 1-2 sentences only

**What counts as "major"?**
- Epic/in Initiative work (completing a feature or workflow)
- Production issues fixed (that affected customers)
- Security or compliance improvements
- Infrastructure changes that impact the team
- Do NOT include: small bug fixes, minor tweaks, routine maintenance, configuration changes, documentation-only updates

### Wins Section
- **Group by initiative**: Usually "Initiative Name" and "Platform Reliability & KTLO" or similar
- **Use bullet points**: One bullet per major accomplishment
- **Keep brief**: 1-2 short sentences per bullet
- **Lead with what was done**: "Fixed X" or "Delivered Y"
- **Include Jira links**: Use format `[text](https://envato.atlassian.net/browse/TICKET-ID)`
- **Reference multiple tickets**: Use "See:" followed by comma-separated links when appropriate
- **Avoid detailed explanations**: Just the essential outcome
- **Use simple bullet format**: `*` markdown bullets with headings for sections

**Example from real sprint report:**
```markdown
Wins:
-----

### Discrepancy Management Initiative
* [Discrepancy Management pipeline delivered](https://envato.atlassian.net/browse/ATH-1512). System detects name mismatches and locks authors to ID verification. Pipeline works across three systems. See: [ATH-1512](https://envato.atlassian.net/browse/ATH-1512), [ATH-1508](https://envato.atlassian.net/browse/ATH-1508), [ATH-1513](https://envato.atlassian.net/browse/ATH-1513)
* [Added explanatory messaging for authors](https://envato.atlassian.net/browse/ATH-1521). Authors now understand why they need to redo ID verification. Reduces support tickets.

### Platform Reliability & KTLO
* [Fixed offboarding process](https://envato.atlassian.net/browse/ATH-1494). Authors now get correct upload rights. See: [ATH-1494](https://envato.atlassian.net/browse/ATH-1494), [ATH-1495](https://envato.atlassian.net/browse/ATH-1495)
* [Stopped sending W-form emails](https://envato.atlassian.net/browse/ATH-1520). This was causing Google to block Envato accounts.
* [Fixed production issues](https://envato.atlassian.net/browse/ATH-1522): invoice processing, Storybook deployment. See: [ATH-1522](https://envato.atlassian.net/browse/ATH-1522), [ATH-1525](https://envato.atlassian.net/browse/ATH-1525)
```

**Another example (Authz team):**
```markdown
Wins:
-----

* Loads of KTLO support done (more than usual)
* Made some progress on our GDPR spikes - 1 finished, 3 in review
* Fast turnaround on new scope - building the SSO query API for workato to retrieve user data
```

### Challenges Section
- **Use simple language**: "Problem: X. Solution: Y."
- **Use bullet points**: One bullet per challenge
- **Be brief**: 1-2 sentences per challenge
- **Be constructive**: Acknowledge challenges without making the team look bad
- **Include mitigation**: Note how challenges were addressed in simple terms

**Example from real sprint report:**
```markdown
Challenges and risks:
---------------------

* Verifying three systems working together. Each system deploys at different times. All connections verified before launch.
* Verification expiry could affect authors with non-English names. Paused that group for review. Completed 1,826 verifications safely.
```

**Another example (Data Engineering):**
```markdown
Challenges and risks:
---------------------

* Impact of the new App - analysis and risk assessment.
* Navigating ingestion via Airbyte - ongoing issues with data and persistent issues (bugs) - we are however working with Airbyte to smoothen these issues out.
```

### Additional Notes Section
- **Keep it very brief**: 3-4 bullets max
- **Forward-looking**: What's coming next? Focus on concrete commitments or timelines
- **One bullet per topic**
- **No sub-bullets or details**
- **Optional sections**: Only include if there's something noteworthy (upcoming launches, major initiatives starting, dependencies, monitoring changes)

**Example from real sprint report:**
```markdown
Additional Notes:
-----------------

* Discrepancy Management automated emails launch November 10th.
* Next sprint will add address and date of birth mismatch detection.
* Tuning DataDog alert thresholds to reduce noise.
```

## Output Format

Save as `sprint-report/dd-mm-yyyy/OUTPUT.md`:

```markdown
**Domain: Author**

**Team:** Author

**Sprint Start**: YYYY-MM-DD

**End Date:** YYYY-MM-DD

Sprint Goal:
------------

**Goal**: [Sprint goal statement]

**Status**: Done

[1-2 sentences explaining what was achieved]

Wins:
-----

### [Initiative Name]
* [Major accomplishment with Jira link](https://envato.atlassian.net/browse/XXX-XXXX). [Impact or benefit]. See: [XXX-XXXX](https://envato.atlassian.net/browse/XXX-XXXX), [XXX-YYYY](https://envato.atlassian.net/browse/XXX-YYYY)
* [Another accomplishment](https://envato.atlassian.net/browse/XXX-ZZZZ). [Brief impact].

### Platform Reliability & KTLO
* [KTLO item](https://envato.atlassian.net/browse/XXX-AAAA). [Brief impact].

Challenges and risks:
---------------------

* [Challenge 1 in 1-2 sentences]. [How handled].

* [Challenge 2 in 1-2 sentences]. [How addressed].

Additional Notes:
-----------------

* [Forward-looking note 1].

* [Forward-looking note 2].

---

Key Metrics:
------------

**Sprint Burnup**
[One sentence about sprint progress]

**Velocity**
[One sentence about velocity]

**Cycle time**
[One sentence about cycle time]
```

## Expected Output

- File: `sprint-report/dd-mm-yyyy/OUTPUT.md` (where dd-mm-yyyy matches the source directory)
- Format: Matches the sprint report template from Confluence
- Content: Improved draft with better context and executive-friendly language
- Language: Simple, direct, accessible to non-native English speakers
- Sections: Complete with Sprint Goal, Wins, Challenges, Additional Notes, Metrics
- Quality: Clear, concise, business-focused, no jargon, short sentences

## Common Mistakes to Avoid

- **Too much detail**: Don't list every ticket or every accomplishment
- **Technical jargon**: Use "user" not "system user", "fix" not "remediate"
- **Passive voice**: "System blocks" not "Author is blocked"
- **Listing tickets**: Don't make tickets the subject ("ATH-1512 fixed X"). Instead: "Fixed X. See ATH-1512"
- **Nested bullets**: Keep it flat with only one level under section headers
- **Vague benefits**: "Improved experience" is vague. "Reduces support tickets by 30%" is specific
- **Forgetting the "why"**: Always answer "why does this matter?" after stating what was done

## Tone and Voice

**Be professional but realistic:**
- ✅ "Strong progress" not "Excellent performance"
- ✅ "Completed 90% of planned work" not "Over-delivered with 110% completion"
- ✅ "Team kept focus while handling emergencies" not "Team demonstrated incredible discipline"
- ✅ "Fixed production issues" not "Seamlessly resolved critical blockers"

**Avoid:**
- Overly optimistic language ("amazing", "exceptional", "outstanding")
- Diminishing challenges ("minor issues", "small setbacks")
- Making promises about future sprints ("We will definitely...")
- Being defensive ("Despite challenges", "In spite of...")

**Good tone examples:**
- "System now blocks authors when discrepancies are detected."
- "Completed core pipeline work across three systems."
- "Handled production issues promptly."
- "Some complex cases paused for review."


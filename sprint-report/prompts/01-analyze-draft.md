# Analyze Draft Sprint Report

## Goal
Read an existing draft sprint report from Confluence and extract key information.

## Task

Read the draft sprint report and identify:

1. **Sprint Details**
   - Sprint start date
   - Sprint end date
   - Sprint goal (if mentioned)

2. **Work Items Referenced**
   - All Jira ticket numbers mentioned (e.g., ATH-1512)
   - Epic or initiative names
   - Project areas or focus

3. **Current Structure**
   - Sections present (Wins, Challenges, Additional Notes, Metrics)
   - Tone and level of detail
   - What works well and what needs improvement

4. **Missing Context**
   - Areas that seem vague or unclear
   - Technical jargon that needs simplification
   - Business value not clearly articulated

## Instructions

- Read the draft page from Confluence
- Parse the content for the information above
- Identify patterns in how work is organized
- Note any inconsistencies or areas that could be clearer

## Output Format

Save as `sprint-report/dd-mm-yyyy/draft-analysis.md`:

```markdown
# Draft Sprint Report Analysis

## Sprint Details
- **Start Date**: YYYY-MM-DD
- **End Date**: YYYY-MM-DD
- **Sprint Goal**: [goal text]

## Work Items Referenced
- [List all ticket numbers mentioned]
  - ATH-1512
  - ATH-1524
  - ...

## Current Structure
- Sections present: [Wins, Challenges, Additional Notes, Metrics]
- Tone: [technical, business-focused, etc.]
- Length: [brief or verbose]

## Key Issues to Address
- [List specific issues with the current draft]
  - Too technical
  - Lacks business value
  - Poor grouping
  - etc.

## Work Items to Investigate Further
[List work items that need deeper context to understand their business value]
```

## Expected Output

- File: `sprint-report/dd-mm-yyyy/draft-analysis.md`
- Contains sprint dates and all ticket numbers
- Identifies improvement opportunities
- Notes missing context or unclear areas


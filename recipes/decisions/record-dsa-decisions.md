# Recording DSA Project Circle Decisions

This recipe documents how to extract and record decisions made during DSA project circle meetings into the decision log.

## Context

- DSA project circle meetings are documented in Google Doc: `1mZg707xGXKJzKLAvX381rtNPELFU7aFxju2tb5YdNO4`
- Decision log is maintained in Google Sheets: `1AMssMC5UbxfyuWZENbGUPZag-Ji07AshGCGHKL0NsbE`
- Decisions need to be recorded systematically with proper IDs and full context

## Process

### 1. Read the Meeting Notes

Read the DSA project circle meeting notes document to identify decisions made in the latest meeting:

```
Use mcp_gdrive_gdrive_read_file with fileId: 1mZg707xGXKJzKLAvX381rtNPELFU7aFxju2tb5YdNO4
```

The document will be large. Search for recent meeting dates and decision markers:
- Look for today's date or recent meeting dates
- Search for keywords: "Decision:", "**Decision:**", etc.
- Use grep with context lines (-C) to get surrounding information

### 2. Read the Decision Log Structure

Read the decision log spreadsheet to understand the column structure and identify the next available decision ID:

```
Use mcp_gdrive_gsheets_read with spreadsheetId: 1AMssMC5UbxfyuWZENbGUPZag-Ji07AshGCGHKL0NsbE
```

Key columns in the decision log:
1. **Column A**: Decision ID (e.g., D001, D002, ...)
2. **Column B**: Title
3. **Column C**: Decision
4. **Column D**: Decision Status (e.g., "Accepted")
5. **Column E**: Context
6. **Column F**: Type (e.g., "Product")
7. **Column G**: Page/product (e.g., "Author domain")
8. **Column H**: Date
9. **Column I**: Recorded By
10. **Column J**: Owner
11. **Column K**: Rationale
12. **Column L**: Related Documents
13. **Column M**: Issues (will occur)
14. **Column N**: Risks (potential to occur)
15. **Column O**: Mitigation
16. **Column P**: Likelihood of risks occurring
17. **Column Q**: Impact of risks if they occur
18. **Column R**: Actions
19. **Column S**: CDP Comments

### 3. Extract Decisions from Meeting Notes

For each decision found:
- Extract the decision statement
- Capture surrounding context (why it was made, what was discussed)
- Note any rationale provided
- Identify any risks, issues, or actions mentioned
- Note who was present/involved

### 4. Format Decisions for the Log

Create a table with rows for each decision, following this template:

```markdown
| Decision ID | Title | Decision | Decision Status | Context | Type | Page/product | Date | Recorded By | Owner | Rationale | Related Documents | Issues | Risks | Mitigation | Likelihood | Impact | Actions |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| D0XX | [Short descriptive title] | [Full decision statement] | Accepted | [Background context] | Product | Author domain | DD/MM/YYYY | Jonathan Williams | [Owner name] | [Why this decision] | Meeting notes [date] | [Known issues] | [Potential risks] | [How to mitigate] | Low/Medium/High | Low/Medium/High | [Next steps] |
```

**Guidelines for each field:**
- **Decision ID**: Use next sequential ID after the last one in the log
- **Title**: Short, descriptive title (5-10 words)
- **Decision**: Clear statement of what was decided
- **Decision Status**: Typically "Accepted" for agreed decisions
- **Context**: Background information about why this decision was needed
- **Type**: Usually "Product" for DSA decisions
- **Page/product**: Usually "Author domain"
- **Date**: Format as DD/MM/YYYY
- **Recorded By**: Your name
- **Owner**: Person responsible for implementation (often Matt Ward, Shannon Ryan, Ana Djordjevic, etc.)
- **Rationale**: Why this decision makes sense
- **Related Documents**: "Meeting notes [date]" or specific doc references
- **Issues**: Known issues that will occur as a result
- **Risks**: Potential risks that might occur
- **Mitigation**: How risks are being mitigated
- **Likelihood**: Low/Medium/High - likelihood of risks occurring
- **Impact**: Low/Medium/High - impact if risks occur
- **Actions**: Next steps or actions required

### 5. Create Slack Message

Create a summary message for Slack that:
- Lists each decision with its ID
- Provides a brief description
- Links to the decision log
- Is concise and scannable

Example format:

```
Hi team 👋

I've just recorded [X] decisions from today's project circle meeting ([date]) in the decision log:

• *D0XX: [Title]* - [Brief description]

• *D0YY: [Title]* - [Brief description]

All decisions have been added to the decision doc with full context, rationale, and actions.

📊 Decision log: https://docs.google.com/spreadsheets/d/1AMssMC5UbxfyuWZENbGUPZag-Ji07AshGCGHKL0NsbE/edit
```

## Example

See the decisions recorded on 11 Nov 2025:
- D050: Email journeys - will leave on
- D051: Add 53-day offboarding warning email
- D052: Proactive outreach to high earners at 30 days

## Tips

- **Look for bold "Decision:" markers** in the meeting notes - these are usually clearly marked
- **Capture the full context** - don't just record the decision, explain why it matters
- **Identify the owner** - who is responsible for implementing this? (Matt Ward for product decisions, Shannon Ryan for operational, Ana Djordjevic for engineering, etc.)
- **Consider risks and mitigation** - even if not explicitly stated, think through potential issues
- **Link related decisions** - if a decision references or modifies a previous decision, note that
- **Use consistent formatting** - follow the existing patterns in the decision log
- **Be thorough but concise** - provide enough detail to understand the decision in future without reading the entire meeting notes

## Common Decision Owners

- **Matt Ward**: Overall product decisions, strategic direction
- **Shannon Ryan**: Operational processes, support procedures
- **Ana Djordjevic**: Technical implementation, engineering
- **Anabella Rivas**: Compliance, documentation
- **Fraser Ross**: Legal considerations
- **Ellen Thomas**: Project management, coordination

## Related Documents

- DSA Project Circle Notes: https://docs.google.com/document/d/1mZg707xGXKJzKLAvX381rtNPELFU7aFxju2tb5YdNO4
- Decision Log: https://docs.google.com/spreadsheets/d/1AMssMC5UbxfyuWZENbGUPZag-Ji07AshGCGHKL0NsbE/edit


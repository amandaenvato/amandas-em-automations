# Feedback Collection - Main Orchestrator

This prompt coordinates the **information collection** phase for generating team feedback.

## Two-Phase Process

This system operates in two phases:
Gather raw data from multiple sources into individual analysis files.

## Collection Process
Execute the following prompts in sequence:

1. **Current Document** → `prompts/01-current-doc.md`
2. **Slack Analysis** → `prompts/02-slack-analysis.md`
3. **Jira Analysis** → `prompts/03-jira-analysis.md`
4. **Culture Amp Data** → `prompts/04-culture-amp.md`

## Output Structure
```
feedback/dd-mm-yyyy/
├── slack-ana.md
├── slack-matt.md
├── jira-ana.md
├── jira-matt.md
├── culture-ana.md
├── culture-matt.md
└── current-doc.md
```

## Instructions

1. Create a directory named `feedback/dd-mm-yyyy/` where `dd-mm-yyyy` is today's date
2. Execute prompts 01-04 in sequence
3. Save all generated reports in the new directory
4. Each report should be comprehensive and ready for review
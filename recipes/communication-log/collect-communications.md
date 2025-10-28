# Collect Communications

This prompt coordinates the **information collection** phase for automating the Communication Log section of the Stakeholder Communication Plan document.

## Task

Run these prompts in sequence:

1. Execute `prompts/01-read-current-doc.md` to get the current Communication Log
2. Execute `prompts/02-slack-communications.md` to collect Slack communications
3. Execute `prompts/03-synthesize-log.md` to generate new log entries

If for whatever reason the task cannot be completed, explain the issue and ask if the user wants to retry those failures.

## Output Structure

All output goes into `communication-log/dd-mm-yyyy/`:
- `current-communication-log.md` - Current state from Google Drive
- `slack-communications.md` - Collected Slack communications
- `OUTPUT.md` - **Final output**: New table rows ready to append

## Context

### Target Document
- File ID: `1wrGqDXthhJ_pgHdPB_neJxbIYHT0YXRFfqk9JYOPV48`
- Document: "Stakeholder Communication Plan"
- Section: "Communication Log" table

### Important: Read People Information First
**Before starting**, read the `recipes/people-info.md` file to get information about the subject person (Jonathan Williams).

## How It Works

### Step 1: Get Current Log
Read the existing Communication Log table to determine:
- The last entry date (this sets the collection period)
- The table format to match

### Step 2: Collect Slack Communications
Search for messages from the last entry date. Default period: **7 days**.

Channels to search:
- Company-wide: `#env-deployments`, `#shoutouts`, `#envato-delivery-and-projects`
- Leadership: `#extended-technology-leadership-team`, `#cust-account-mgmt-and-author-leadership`
- Product: `#author-product-trio`
- Team: `#author-domain`
- Projects: `#author-compliance-management-dsa`, `#proj-upload-handover`, `#tmp-salesforce-workato-poc`

### Step 3: Synthesize New Entries
Combine collected data into new Communication Log table rows matching the exact format from the document.

## Stakeholder Groups to Track

- Company-Wide
- Technology Heads (Ray, Nick)
- Domain Leadership
- Mark (Direct Manager)
- Author Product Trio
- Technology team
- Author Team
- Tech People People
- People Team
- DSA: Project Stakeholders
- Upload Handover: Project Stakeholders
- Salesforce Continuity: Project Stakeholders
- Tax (Author): Project Stakeholders

## Types of Communications to Capture

- Sprint reports and updates
- Deployment notices
- Shoutouts and recognition
- Escalations or risks surfaced
- Decisions or decisions needed
- Project updates to stakeholders
- Leadership updates
- Monthly product slides
- Team communications

## Timeline

Default collection period: Period of time since the last Communication Log entry.


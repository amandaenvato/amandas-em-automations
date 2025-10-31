# Identify and Start Cursor Agent Recipe

This recipe explains how to identify Jira tickets suitable for autonomous Cursor agent work, prepare them properly, and start an agent to complete the changes.

## Before Starting

**Review the em-knowledgebase** to understand:
- What makes a good candidate for autonomous agent work
- The Author domain systems and repositories
- How to search and update Jira tickets
- How to use the Cursor agent API

## Overview

The goal is to identify backlog tickets that are suitable for autonomous Cursor agent completion, ensure they're properly labeled, select the best candidate, do initial planning research, update the ticket description with findings, and start an agent to complete the work.

## Step-by-Step Process

### 1. Search for Candidate Tickets

Search Jira for tickets in the backlog that might be suitable for agent work.

**Key Parameters:**
- `jql`: `project = ATH AND status = Backlog ORDER BY updated DESC`
- `limit`: 50 to get a good sample
- `fields`: Include `summary,status,description,priority,issuetype,labels,created,updated`

**Look for tickets with:**
- Clear, unambiguous requirements
- Well-defined acceptance criteria
- Technical tasks (upgrades, refactoring, bug fixes)
- Low risk changes (text updates, dependency upgrades)
- Already labeled with `ai-suitable` (or should be)

### 2. Analyze Ticket Suitability

Evaluate each ticket against these criteria:

**Excellent Candidates:**
- ✅ Clear acceptance criteria ("Done When" section)
- ✅ Self-contained technical changes
- ✅ Low business logic impact
- ✅ Easy to verify (tests/builds)
- ✅ Well-defined scope
- ✅ Single repository changes

**Avoid:**
- ❌ Tickets requiring extensive human coordination
- ❌ Tickets with ambiguous requirements
- ❌ Tickets affecting multiple repositories (unless straightforward)
- ❌ Tickets requiring business decisions
- ❌ Tickets with unclear success criteria

### 3. Ensure Labels Are Accurate

Check if tickets have the `ai-suitable` label. Add it to tickets that meet the criteria.

**Process:**
- Review tickets identified as good candidates
- Use `jira_update_issue` to add `ai-suitable` label to tickets that don't have it
- Label format: `{'labels': ['ai-suitable']}`

**Tickets to Label:**
- Dependency upgrades with clear commands
- Simple text/copy changes
- Code cleanup/deletion tasks
- Security fixes with clear steps
- Bug fixes with clear reproduction steps

### 4. Select the Best Candidate

Rank candidates by:
1. **Clarity** - Zero ambiguity in requirements
2. **Risk** - Lowest chance of breaking things
3. **Scope** - Single file/repository changes preferred
4. **Verification** - Easy to verify completion

**Best Candidates Typically:**
- Text/copy updates (single string replacement)
- Package version upgrades (single file change)
- Code deletion (clear scope)
- Simple bug fixes (clear reproduction)

### 5. Conduct Initial Planning Research

Gather context from multiple sources to understand the ticket fully.

**Research Sources:**

**Slack:**
- Search for discussions about the ticket topic
- Look for related requests or context
- Find original request threads

**Jira:**
- Search for related tickets
- Check parent epics and linked issues
- Review ticket history and comments

**Confluence:**
- Search for documentation about the feature/system
- Review related RFCs or ADRs
- Check process documentation

**Google Drive:**
- Search for related documents or specifications
- Review project documentation

**GitHub:**
- Search codebase for related code
- Find exact file locations
- Identify which repository contains the change

**Key Questions to Answer:**
- Which repository needs to change?
- What exact file(s) need modification?
- What is the current state?
- What should the new state be?
- Are there any dependencies or related changes?
- What is the context/background for this change?

### 6. Update Jira Ticket Description

Enrich the ticket description with planning findings.

**Sections to Add/Update:**

```markdown
h2. Context
- Business context and background
- Related initiatives or projects
- Request source (Slack, email, etc.)

h2. Change Required
- Exact current state
- Exact desired state
- Location/page affected

h2. Technical Details
- Repository: `envato/repo-name`
- File Path: `path/to/file.ext`
- Specific keys/fields to change
- Current value (exact)
- New value (exact)

h2. Background
- Related work or initiatives
- Why this change is needed
- Any relevant context

h2. Done When
- Clear acceptance criteria
- Verification steps
- Testing requirements

h2. References
- Links to Slack threads
- Related documentation
- RFC or ADR links
```

**Key Principles:**
- Be specific with file paths and values
- Include exact text/values (copy-paste ready)
- Add context from research
- Make it actionable for an autonomous agent
- Include verification steps

### 7. Start Cursor Agent

Use the Cursor agent API to start autonomous work.

**Key Parameters:**
- `repository_url`: Full GitHub URL (e.g., `https://github.com/envato/author-platform`)
- `prompt`: Detailed task description
- `auto_create_pull_request`: `true` to automatically create PR
- `agent_name`: Descriptive name for the agent

**Prompt Structure:**

```markdown
## Task: [Ticket Title] ([Ticket Key])

[Brief description]

### Context
[Background and why this change is needed]

### Change Required

**File:** `path/to/file.ext`
**Key/Field:** `specific_key`

**Current Value:**
```
exact current value
```

**New Value:**
```
exact new value
```

### Acceptance Criteria

1. [Specific criterion 1]
2. [Specific criterion 2]
3. [Verification step]

### Notes
- [Any important notes]
- [Constraints or considerations]
- [Testing requirements]
```

**Include in Prompt:**
- Exact file paths
- Exact current and new values
- Clear acceptance criteria
- Jira ticket link
- Branch name suggestion (if applicable)
- PR requirements (title format, body content)

## Output Format

After completing the process, provide:

1. **Summary** of tickets reviewed
2. **Selected candidate** with reasoning
3. **Planning findings** (repository, files, context)
4. **Agent details** (ID, status, repository)
5. **Next steps** (monitoring, review)

## Key Learnings

### Ticket Selection Criteria

**Best Candidates:**
- Text/copy updates: Zero ambiguity, low risk
- Dependency upgrades: Clear commands, single file
- Code deletion: Well-defined scope
- Simple bug fixes: Clear reproduction

**Avoid:**
- Tickets requiring investigation first
- Tickets with ambiguous requirements
- Tickets affecting multiple repositories
- Tickets requiring business decisions

### Planning Research Strategy

**Always Check:**
- Which repository contains the code
- Exact file location
- Current vs. desired state
- Related work or context
- Verification requirements

**Sources to Check:**
- Slack for original requests
- Jira for related tickets
- Confluence for documentation
- GitHub for code location
- Google Drive for specifications

### Ticket Description Best Practices

**Include:**
- Exact file paths (copy-paste ready)
- Exact values (current and new)
- Clear acceptance criteria
- Context and background
- Verification steps
- References to related work

**Format:**
- Use clear headings
- Include code blocks for exact values
- Add links to related resources
- Make it actionable for autonomous agents

### Agent Prompt Guidelines

**Ensure Prompt Has:**
- Clear task description
- Exact file paths
- Exact current/new values
- Specific acceptance criteria
- Context and background
- PR requirements
- Branch name suggestion

**Good Prompt Characteristics:**
- Self-contained (all info needed)
- Unambiguous (no interpretation needed)
- Actionable (clear steps)
- Verifiable (clear success criteria)

## Common Pitfalls to Avoid

1. **Incomplete Planning**: Not checking which repository contains the code
2. **Ambiguous Requirements**: Not providing exact values/file paths
3. **Missing Context**: Not researching background or related work
4. **Wrong Repository**: Assuming repository without verification
5. **Incomplete Ticket Description**: Not updating ticket with findings
6. **Weak Agent Prompt**: Not providing enough detail for autonomous work
7. **Multiple Repositories**: Selecting tickets requiring changes in multiple repos (should pick different ticket)

## Example Workflow

1. **Search**: `project = ATH AND status = Backlog ORDER BY updated DESC`
2. **Analyze**: Review tickets for suitability
3. **Label**: Add `ai-suitable` to good candidates
4. **Select**: Choose best candidate (e.g., simple text update)
5. **Research**: Check Slack, Jira, Confluence, GitHub for context
6. **Update**: Enrich ticket description with findings
7. **Start Agent**: Create detailed prompt and start Cursor agent
8. **Monitor**: Track agent progress and PR creation

## Related Resources

- [Cursor Agent API Documentation](https://cursor.com/dashboard)
- [Jira Update Issue API](../em-knowledgebase/tools/jira.md)
- [GitHub Code Search Patterns](../em-knowledgebase/tools/patterns.md)
- [Daily Checkup Workflow](../daily-checkup/daily-checkup.md) - For finding tickets


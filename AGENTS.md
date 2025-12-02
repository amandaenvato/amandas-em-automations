# Agent Guidelines

Guidelines for AI agents working in this codebase.

## Executing Recipes

- **Always respond with messages in markdown format** for better readability
- **Outputs**: Create outputs in `files/output/` with dated directories (e.g., `files/output/daily-checkup-15-01-2025/`)
- **Output files**: Typically include an `OUTPUT.md` file with the main results, plus any supporting files as specified in the recipe
- **Follow recipe instructions precisely**: Recipes contain step-by-step workflows that should be executed in order

## Executing Arbitrary Tasks Using MCPs

- **Documentation**: Unless otherwise stated, create files in `files/scratch/` to document your thoughts, analysis, and decision-making process
- **Recipe generation**: After completing a task, ask if the user would like to generate a recipe from the activity for future reuse
- **Data masquerading**: When generating recipe files, always masquerade any PII (Personally Identifiable Information) such as real names, email addresses, Slack IDs, Jira account IDs, or other identifiers. Replace them with fake example identifiers (e.g., "Alex Johnson", "alex.johnson@example.com", "U1234567890")
- **File naming**: Use descriptive, kebab-case filenames in the scratch directory (e.g., `user-disablement-investigation.md`)

## Atlassian MCP (Jira/Confluence) Usage

- **Docker-first approach**: Always try Docker MCP server first when accessing Jira or Confluence APIs
- **Docker not running**: If Docker is not running, alert the user with a clear warning message (e.g., "⚠️ WARNING: Docker is installed but the daemon is not running. Please start Docker Desktop.") and attempt to use Docker anyway (in case the user starts it)
- **Fallback to direct API**: Only fall back to direct API clients (`jira_api_client.py` and `confluence_api_client.py`) if Docker MCP server fails after attempting to use it
- **Error handling**: If both Docker and direct API fail, provide clear error messages explaining what failed and what the user should do

## Iterating on Code in `local-mcp/`

- **Restart required**: Remember that the user will need to restart the MCP server tool before you attempt to rerun the tool with new code
- **Manual restart**: The local-mcp server runs as a separate process and must be manually restarted by the user after code changes

## Iterating on Code in `task-manager/`

- **Auto-restart**: After making changes, restart the app using `npm restart` in the background (or ask if the user would like to, if unsure)
- **Location**: Run the restart command from the `task-manager/` directory
- **Background execution**: The restart command kills the existing process and starts a new one

## Configuration Awareness

- **Required config files**: Many recipes depend on `files/recipe-config/people-info.md` for team member information (emails, Slack IDs, Jira account IDs, Culture Amp URLs). Always check this file exists and is populated before executing recipes that reference team members
- **MCP configuration**: Be aware that MCP servers require configuration in `.cursor/mcp.json` - if MCP calls fail, the configuration may need attention
- **Config validation**: When starting a recipe, verify that required configuration files are present and contain the necessary data before proceeding

## Output Organization

- **Directory naming**: Use consistent naming conventions for output directories: `{recipe-name}-{dd-mm-yyyy}/` (e.g., `daily-checkup-15-01-2025/`, `feedback-03-11-2025/`)
- **File structure**: Most recipes create an `OUTPUT.md` file as the main result, plus supporting files as needed (e.g., individual team member files, context files, draft documents)
- **Date format**: Always use `dd-mm-yyyy` format for dates in directory names (e.g., `15-01-2025` for January 15, 2025)
- **Time format**: All times in outputs, activity logs, and documentation must be expressed in Melbourne time (AEDT/AEST). Convert UTC or other timezones to Melbourne time when displaying timestamps
- **Consistency**: Follow the existing output structure patterns you see in `files/output/` - maintain consistency with previous runs

## Code Verification

- **Test before completion**: Before declaring a task complete, verify that any code changes actually work:
  - For `task-manager/`: Ensure the app restarts successfully and the changes function as expected
  - For `local-mcp/`: After the user restarts the server, test the modified functionality if possible
  - For recipes: Verify outputs are created correctly and contain expected content
- **Error checking**: Run linters and check for obvious syntax errors before marking work as done
- **User confirmation**: If you're unsure whether code works (e.g., requires manual testing or user interaction), explicitly state what needs to be verified rather than assuming it's complete

## Git Workflow Preferences

- **Branch and PR creation**: When the user asks to "create a branch and PR" (or similar requests like "branch PR"), automatically:
  1. Create a new branch with a descriptive name (or use existing branch if already on one)
  2. Stage and commit any relevant changes
  3. Push the branch to origin
  4. Create a pull request with an appropriate title and description
  5. Open the PR in the browser using `gh pr view --web`
- **Merging PRs**: **NEVER automatically merge PRs** unless the user explicitly says "merge" (or "merge it", "merge the PR", etc.). When the user says "branch PR" or "create a branch and PR", only create the branch and PR - do NOT merge it.
- **Branch naming**: Use descriptive, kebab-case branch names that reflect the changes (e.g., `enhance-activity-report-links`, `fix-date-format`)
- **PR description**: Include a clear title and description explaining what changed and why

## Allowlist Preferences

User preferences for tool permissions and allowed operations. Document specific allowlist choices here for reference.

**Note**: When you explicitly allow an operation (e.g., "yes, commit that", "go ahead and delete it", "you can use that tool"), the agent will update this section to reflect your preference for future similar operations.

### Tool Permissions

- ✅ **Always allowed**: 
  - Reading files and searching codebase
  - Running linters and checking for errors
  - Reading configuration files (`.cursor/mcp.json`, `AGENTS.md`, etc.)
  - Using codebase search and grep tools
  - Reading terminal output and checking git status

- ✅ **Allowed with context** (proceed when task requires it):
  - Creating new files in appropriate directories (`files/output/`, `files/scratch/`, `files/recipe-config/`)
  - Editing existing files (code, config, documentation)
  - Running terminal commands for development tasks
  - Creating and editing recipes
  - Committing changes to feature branches
  - Creating pull requests

- ⚠️ **Requires explicit confirmation**:
  - **Merging pull requests** - Only merge when the user explicitly says "merge" (or "merge it", "merge the PR", etc.). When user says "branch PR" or "create a branch and PR", do NOT merge automatically - only create the branch and PR.
  - Deleting files (always ask first)
  - Force pushing to any branch
  - Committing to main/master branch
  - Modifying critical config files (`.cursor/mcp.json` with actual secrets)
  - Creating files outside standard directories without clear purpose

- ❌ **Never allowed**:
  - Force pushing to main/master
  - Deleting git history
  - Modifying files in `node_modules/` or other dependency directories
  - Running destructive git operations without explicit request

### MCP Tool Allowlists

#### Slack MCP
- ✅ **Allowed**: Reading messages, searching channels, listing channels
- ⚠️ **Requires confirmation**: Posting messages when explicitly requested
- ⚠️ **Requires confirmation**: Posting to public channels, sending DMs
- **Preferred channels**: Use channel names (e.g., `#metadata-unpacking-project`) when possible

#### GitHub MCP (via local-mcp)
- ✅ **Allowed**: All read-only commands defined in `local-mcp/src/github-cli.js`:
  - `repo-list`, `repo-view`
  - `pr-list`, `pr-view`, `pr-diff`, `pr-files`, `pr-checks`, `pr-status`
  - `issue-list`, `issue-view`
  - `search-code`, `search-prs`, `search-commits`, `search-issues`, `search-repos`, `search-users`
  - `release-list`, `release-view`, `release-download`
  - `branch-list`, `branch-view`
  - `commit-view`
- ❌ **Never allowed**: Write operations (all blocked by design in `local-mcp/src/github-cli.js`)

#### Google Calendar MCP
- ✅ **Allowed**: Reading calendar events, searching events
- ⚠️ **Requires confirmation**: Creating, updating, or deleting calendar events

#### Browser Automation (via local-mcp)
- ✅ **Allowed**: Extracting cookies for authentication
- ✅ **Allowed**: Fetching pages for data extraction (Culture Amp, BambooHR, etc.)
- ⚠️ **Requires confirmation**: Navigating to external/untrusted sites

#### Other MCPs
- **Cursor Agent API**: ✅ Allowed for starting agents when explicitly requested
- **OpenAI API**: ✅ Allowed for AI operations
- **Culture Amp**: ✅ Allowed for conversation analysis

### File Operations

#### File Creation
- ✅ **Standard locations** (auto-approved):
  - `files/output/{recipe-name}-{dd-mm-yyyy}/` - Recipe outputs
  - `files/scratch/` - Temporary analysis and documentation
  - `files/recipe-config/` - Configuration files
  - `recipes/` - New recipe files
- ⚠️ **Other locations**: Ask before creating files outside standard directories
- **Naming conventions**: Use kebab-case for filenames (e.g., `user-disablement-investigation.md`)

#### File Modification
- ✅ **Allowed**: Editing code files, documentation, config files, recipes
- ✅ **Allowed**: Updating `AGENTS.md` to reflect new preferences
- ⚠️ **Requires confirmation**: Modifying files with secrets or sensitive data

#### File Deletion
- ⚠️ **Always requires explicit confirmation**: Never delete files without explicit user approval
- **Exception**: Temporary files created during a task can be cleaned up if explicitly mentioned

### Preference Update Log

When you explicitly allow an operation, it will be documented here:

- **2025-11-18**: ✅ Committing changes to feature branches and creating PRs - allowed
- **2025-11-18**: ✅ Merging PRs when explicitly requested - allowed
- **2025-11-18**: ✅ Using Slack MCP to read messages and search channels - allowed
- **2025-11-18**: ⚠️ Posting Slack messages (even when explicitly requested) - now requires confirmation
- **2025-11-20**: ✅ Automatic branch and PR creation workflow - when user asks for "branch and PR", automatically create branch, commit changes, push, create PR, and open in browser
- **2025-11-25**: ⚠️ Merging PRs - Only merge when user explicitly says "merge". When user says "branch PR" or "create a branch and PR", do NOT automatically merge - only create the branch and PR.

## Additional Guidelines

- **Error handling**: If an MCP call fails or data is unavailable, document the issue in scratch files and continue with available data when possible
- **Clarification**: When recipe instructions are ambiguous or data sources are unclear, ask for clarification rather than making assumptions


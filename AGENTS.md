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
- **File naming**: Use descriptive, kebab-case filenames in the scratch directory (e.g., `user-disablement-investigation.md`)

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
- **Consistency**: Follow the existing output structure patterns you see in `files/output/` - maintain consistency with previous runs

## Code Verification

- **Test before completion**: Before declaring a task complete, verify that any code changes actually work:
  - For `task-manager/`: Ensure the app restarts successfully and the changes function as expected
  - For `local-mcp/`: After the user restarts the server, test the modified functionality if possible
  - For recipes: Verify outputs are created correctly and contain expected content
- **Error checking**: Run linters and check for obvious syntax errors before marking work as done
- **User confirmation**: If you're unsure whether code works (e.g., requires manual testing or user interaction), explicitly state what needs to be verified rather than assuming it's complete

## Additional Guidelines

- **Error handling**: If an MCP call fails or data is unavailable, document the issue in scratch files and continue with available data when possible
- **Clarification**: When recipe instructions are ambiguous or data sources are unclear, ask for clarification rather than making assumptions


import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Explicit mapping of tool names to gh commands
const COMMAND_MAP = {
  "repo-list": "repo list",
  "repo-view": "repo view",
  "pr-list": "pr list",
  "pr-view": "pr view",
  "pr-diff": "pr diff",
  "pr-files": "pr files",
  "pr-checks": "pr checks",
  "pr-status": "pr status",
  "issue-list": "issue list",
  "issue-view": "issue view",
  "search-code": "search code",
  "search-prs": "search prs",
  "search-commits": "search commits",
  "search-issues": "search issues",
  "search-repos": "search repos",
  "search-users": "search users",
  "release-list": "release list",
  "release-view": "release view",
  "release-download": "release download",
  "branch-list": "branch list",
  "branch-view": "branch view",
  "commit-view": "commit view",
};

// Export allowed command keys as an array for use in tool schema
export const ALLOWED_COMMANDS = Object.keys(COMMAND_MAP).sort();

export class GitHubCLI {
  /**
   * Execute a gh CLI command and return the result
   * @private
   */
  async executeCommand(command, args = []) {
    const fullCommand = `gh ${command} ${args.join(" ")}`.trim();

    try {
      const { stdout, stderr } = await execAsync(fullCommand, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
      });

      if (stderr && !stdout) {
        throw new Error(stderr);
      }

      return {
        content: [
          {
            type: "text",
            text: stdout || "Command executed successfully",
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error executing gh command: ${error.message}\nCommand: ${fullCommand}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Execute a read-only gh command with validation
   * @param {string} commandKey - The command key (e.g., 'repo-list', 'pr-view')
   * @param {string[]} args - Arguments to pass to the gh command
   */
  async executeReadOnlyCommand(commandKey, args = []) {
    // Look up the command key in COMMAND_MAP
    const ghCommand = COMMAND_MAP[commandKey];

    // If the key doesn't exist, the command isn't allowed
    if (!ghCommand) {
      const availableCommands = ALLOWED_COMMANDS.join(", ");
      return {
        content: [
          {
            type: "text",
            text: `Command '${commandKey}' is not allowed. Only the following read-only commands are permitted:\n${availableCommands}`,
          },
        ],
        isError: true,
      };
    }

    return await this.executeCommand(ghCommand, args);
  }
}

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

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
   * List repositories in the envato organization
   */
  async listRepos(limit = null) {
    const args = ["--owner", "envato"];
    if (limit) {
      args.push("--limit", limit.toString());
    }
    return await this.executeCommand("repo list", args);
  }

  /**
   * View details of a specific repository
   */
  async viewRepo(repo) {
    if (!repo) {
      return {
        content: [
          {
            type: "text",
            text: "Error: repo parameter is required (e.g., 'envato/repo-name')",
          },
        ],
        isError: true,
      };
    }
    return await this.executeCommand("repo view", [repo]);
  }

  /**
   * List pull requests
   */
  async listPRs(repo = null, state = null, author = null, limit = null) {
    const args = [];
    if (repo) {
      args.push("--repo", repo);
    }
    if (state) {
      args.push("--state", state);
    }
    if (author) {
      args.push("--author", author);
    }
    if (limit) {
      args.push("--limit", limit.toString());
    }
    return await this.executeCommand("pr list", args);
  }

  /**
   * View details of a specific pull request
   */
  async viewPR(prNumber, repo = null) {
    if (!prNumber) {
      return {
        content: [
          {
            type: "text",
            text: "Error: pr_number parameter is required",
          },
        ],
        isError: true,
      };
    }
    const args = [prNumber.toString()];
    if (repo) {
      args.push("--repo", repo);
    }
    return await this.executeCommand("pr view", args);
  }

  /**
   * Search code
   */
  async searchCode(query, repo = null, limit = null) {
    if (!query) {
      return {
        content: [
          {
            type: "text",
            text: "Error: query parameter is required",
          },
        ],
        isError: true,
      };
    }
    const args = [];
    if (repo) {
      args.push("--repo", repo);
    }
    if (limit) {
      args.push("--limit", limit.toString());
    }
    args.push(query);
    return await this.executeCommand("search code", args);
  }

  /**
   * Search pull requests
   */
  async searchPRs(query, repo = null, state = null, author = null, limit = null) {
    if (!query) {
      return {
        content: [
          {
            type: "text",
            text: "Error: query parameter is required",
          },
        ],
        isError: true,
      };
    }
    const args = [];
    if (repo) {
      args.push("--repo", repo);
    }
    if (state) {
      args.push("--state", state);
    }
    if (author) {
      args.push("--author", author);
    }
    if (limit) {
      args.push("--limit", limit.toString());
    }
    args.push(query);
    return await this.executeCommand("search prs", args);
  }

  /**
   * Search commits
   */
  async searchCommits(query, repo = null, author = null, limit = null) {
    if (!query) {
      return {
        content: [
          {
            type: "text",
            text: "Error: query parameter is required",
          },
        ],
        isError: true,
      };
    }
    const args = [];
    if (repo) {
      args.push("--repo", repo);
    }
    if (author) {
      args.push("--author", author);
    }
    if (limit) {
      args.push("--limit", limit.toString());
    }
    args.push(query);
    return await this.executeCommand("search commits", args);
  }
}


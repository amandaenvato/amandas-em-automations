import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exec } from "child_process";
import { promisify } from "util";
import { GitHubCLI } from "./github-cli.js";

// Mock child_process.exec
vi.mock("child_process", () => ({
  exec: vi.fn(),
}));

// Mock util.promisify to return a function that wraps exec
vi.mock("util", async () => {
  const actual = await vi.importActual("util");
  return {
    ...actual,
    promisify: vi.fn((fn) => {
      return async (...args) => {
        return new Promise((resolve, reject) => {
          const callback = (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          };
          fn(...args, callback);
        });
      };
    }),
  };
});

describe("GitHubCLI", () => {
  let githubCLI;
  let mockExec;

  beforeEach(() => {
    githubCLI = new GitHubCLI();
    mockExec = vi.mocked(exec);
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("listRepos", () => {
    it("should execute gh repo list with --owner envato", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("gh repo list");
        expect(command).toContain("--owner envato");
        callback(null, { stdout: "repo1\nrepo2\n", stderr: "" });
      });

      const result = await githubCLI.listRepos();

      expect(mockExec).toHaveBeenCalled();
      expect(result.content[0].text).toBe("repo1\nrepo2\n");
      expect(result.isError).toBeUndefined();
    });

    it("should include --limit when provided", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("--limit 10");
        callback(null, { stdout: "repo1\n", stderr: "" });
      });

      await githubCLI.listRepos(10);

      expect(mockExec).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        callback(new Error("Command failed"), { stdout: "", stderr: "error" });
      });

      const result = await githubCLI.listRepos();

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Error executing gh command");
    });
  });

  describe("viewRepo", () => {
    it("should execute gh repo view with repository", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("gh repo view");
        expect(command).toContain("envato/repo-name");
        callback(null, { stdout: "Repository details", stderr: "" });
      });

      const result = await githubCLI.viewRepo("envato/repo-name");

      expect(mockExec).toHaveBeenCalled();
      expect(result.content[0].text).toBe("Repository details");
    });

    it("should return error when repo is missing", async () => {
      const result = await githubCLI.viewRepo(null);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("repo parameter is required");
      expect(mockExec).not.toHaveBeenCalled();
    });

    it("should return error when repo is empty string", async () => {
      const result = await githubCLI.viewRepo("");

      expect(result.isError).toBe(true);
      expect(mockExec).not.toHaveBeenCalled();
    });
  });

  describe("listPRs", () => {
    it("should execute gh pr list with no filters", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("gh pr list");
        callback(null, { stdout: "PR #1\nPR #2\n", stderr: "" });
      });

      const result = await githubCLI.listPRs();

      expect(mockExec).toHaveBeenCalled();
      expect(result.content[0].text).toBe("PR #1\nPR #2\n");
    });

    it("should include --repo when provided", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("--repo envato/repo-name");
        callback(null, { stdout: "PR #1\n", stderr: "" });
      });

      await githubCLI.listPRs("envato/repo-name");

      expect(mockExec).toHaveBeenCalled();
    });

    it("should include --state when provided", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("--state open");
        callback(null, { stdout: "PR #1\n", stderr: "" });
      });

      await githubCLI.listPRs(null, "open");

      expect(mockExec).toHaveBeenCalled();
    });

    it("should include --author when provided", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("--author username");
        callback(null, { stdout: "PR #1\n", stderr: "" });
      });

      await githubCLI.listPRs(null, null, "username");

      expect(mockExec).toHaveBeenCalled();
    });

    it("should include --limit when provided", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("--limit 5");
        callback(null, { stdout: "PR #1\n", stderr: "" });
      });

      await githubCLI.listPRs(null, null, null, 5);

      expect(mockExec).toHaveBeenCalled();
    });

    it("should combine all filters", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("--repo envato/repo-name");
        expect(command).toContain("--state closed");
        expect(command).toContain("--author username");
        expect(command).toContain("--limit 10");
        callback(null, { stdout: "PR #1\n", stderr: "" });
      });

      await githubCLI.listPRs("envato/repo-name", "closed", "username", 10);

      expect(mockExec).toHaveBeenCalled();
    });
  });

  describe("viewPR", () => {
    it("should execute gh pr view with PR number", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("gh pr view");
        expect(command).toContain("123");
        callback(null, { stdout: "PR #123 details", stderr: "" });
      });

      const result = await githubCLI.viewPR(123);

      expect(mockExec).toHaveBeenCalledTimes(1);
      expect(result.content[0].text).toBe("PR #123 details");
    });

    it("should include --repo when provided", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("--repo envato/repo-name");
        callback(null, { stdout: "PR #123 details", stderr: "" });
      });

      await githubCLI.viewPR(123, "envato/repo-name");

      expect(mockExec).toHaveBeenCalled();
    });

    it("should return error when pr_number is missing", async () => {
      const result = await githubCLI.viewPR(null);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("pr_number parameter is required");
      expect(mockExec).not.toHaveBeenCalled();
    });

    it("should convert PR number to string", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("456");
        callback(null, { stdout: "PR details", stderr: "" });
      });

      await githubCLI.viewPR(456);

      expect(mockExec).toHaveBeenCalled();
    });
  });

  describe("searchCode", () => {
    it("should execute gh search code with query", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("gh search code");
        expect(command).toContain("function test");
        callback(null, { stdout: "search results", stderr: "" });
      });

      const result = await githubCLI.searchCode("function test");

      expect(mockExec).toHaveBeenCalled();
      expect(result.content[0].text).toBe("search results");
    });

    it("should include --repo when provided", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("--repo envato/repo-name");
        callback(null, { stdout: "results", stderr: "" });
      });

      await githubCLI.searchCode("query", "envato/repo-name");

      expect(mockExec).toHaveBeenCalled();
    });

    it("should include --limit when provided", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("--limit 20");
        callback(null, { stdout: "results", stderr: "" });
      });

      await githubCLI.searchCode("query", null, 20);

      expect(mockExec).toHaveBeenCalled();
    });

    it("should return error when query is missing", async () => {
      const result = await githubCLI.searchCode(null);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("query parameter is required");
      expect(mockExec).not.toHaveBeenCalled();
    });

    it("should return error when query is empty string", async () => {
      const result = await githubCLI.searchCode("");

      expect(result.isError).toBe(true);
      expect(mockExec).not.toHaveBeenCalled();
    });
  });

  describe("searchPRs", () => {
    it("should execute gh search prs with query", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("gh search prs");
        expect(command).toContain("bug fix");
        callback(null, { stdout: "PR results", stderr: "" });
      });

      const result = await githubCLI.searchPRs("bug fix");

      expect(mockExec).toHaveBeenCalled();
      expect(result.content[0].text).toBe("PR results");
    });

    it("should include --repo when provided", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("--repo envato/repo-name");
        callback(null, { stdout: "results", stderr: "" });
      });

      await githubCLI.searchPRs("query", "envato/repo-name");

      expect(mockExec).toHaveBeenCalled();
    });

    it("should include --state when provided", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("--state open");
        callback(null, { stdout: "results", stderr: "" });
      });

      await githubCLI.searchPRs("query", null, "open");

      expect(mockExec).toHaveBeenCalled();
    });

    it("should include --author when provided", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("--author username");
        callback(null, { stdout: "results", stderr: "" });
      });

      await githubCLI.searchPRs("query", null, null, "username");

      expect(mockExec).toHaveBeenCalled();
    });

    it("should include --limit when provided", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("--limit 15");
        callback(null, { stdout: "results", stderr: "" });
      });

      await githubCLI.searchPRs("query", null, null, null, 15);

      expect(mockExec).toHaveBeenCalled();
    });

    it("should combine all filters", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("--repo envato/repo-name");
        expect(command).toContain("--state closed");
        expect(command).toContain("--author username");
        expect(command).toContain("--limit 25");
        expect(command).toContain("bug fix");
        callback(null, { stdout: "results", stderr: "" });
      });

      await githubCLI.searchPRs("bug fix", "envato/repo-name", "closed", "username", 25);

      expect(mockExec).toHaveBeenCalled();
    });

    it("should return error when query is missing", async () => {
      const result = await githubCLI.searchPRs(null);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("query parameter is required");
      expect(mockExec).not.toHaveBeenCalled();
    });
  });

  describe("searchCommits", () => {
    it("should execute gh search commits with query", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("gh search commits");
        expect(command).toContain("initial commit");
        callback(null, { stdout: "commit results", stderr: "" });
      });

      const result = await githubCLI.searchCommits("initial commit");

      expect(mockExec).toHaveBeenCalled();
      expect(result.content[0].text).toBe("commit results");
    });

    it("should include --repo when provided", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("--repo envato/repo-name");
        callback(null, { stdout: "results", stderr: "" });
      });

      await githubCLI.searchCommits("query", "envato/repo-name");

      expect(mockExec).toHaveBeenCalled();
    });

    it("should include --author when provided", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("--author username");
        callback(null, { stdout: "results", stderr: "" });
      });

      await githubCLI.searchCommits("query", null, "username");

      expect(mockExec).toHaveBeenCalled();
    });

    it("should include --limit when provided", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("--limit 30");
        callback(null, { stdout: "results", stderr: "" });
      });

      await githubCLI.searchCommits("query", null, null, 30);

      expect(mockExec).toHaveBeenCalled();
    });

    it("should combine all filters", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(command).toContain("--repo envato/repo-name");
        expect(command).toContain("--author username");
        expect(command).toContain("--limit 50");
        expect(command).toContain("fix bug");
        callback(null, { stdout: "results", stderr: "" });
      });

      await githubCLI.searchCommits("fix bug", "envato/repo-name", "username", 50);

      expect(mockExec).toHaveBeenCalled();
    });

    it("should return error when query is missing", async () => {
      const result = await githubCLI.searchCommits(null);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("query parameter is required");
      expect(mockExec).not.toHaveBeenCalled();
    });
  });

  describe("executeCommand error handling", () => {
    it("should handle command execution errors", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        callback(new Error("gh: command not found"), { stdout: "", stderr: "" });
      });

      const result = await githubCLI.listRepos();

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Error executing gh command");
      expect(result.content[0].text).toContain("gh repo list");
    });

    it("should handle stderr-only output", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        callback(null, { stdout: "", stderr: "Warning: deprecated flag" });
      });

      const result = await githubCLI.listRepos();

      expect(result.isError).toBe(true);
    });

    it("should return empty stdout message when command succeeds with no output", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        callback(null, { stdout: "", stderr: "" });
      });

      const result = await githubCLI.listRepos();

      expect(result.content[0].text).toBe("Command executed successfully");
    });

    it("should use maxBuffer option", async () => {
      mockExec.mockImplementation((command, options, callback) => {
        expect(options.maxBuffer).toBe(10 * 1024 * 1024);
        callback(null, { stdout: "output", stderr: "" });
      });

      await githubCLI.listRepos();

      expect(mockExec).toHaveBeenCalled();
    });
  });
});


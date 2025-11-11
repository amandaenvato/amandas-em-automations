import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LocalMCPServer } from "./index.js";

describe("LocalMCPServer", () => {
  let server;
  let originalEnv;
  let originalFetch;

  beforeEach(() => {
    originalEnv = process.env.CURSOR_API_KEY;
    originalFetch = global.fetch;
    delete process.env.CURSOR_API_KEY;
    server = new LocalMCPServer();
  });

  afterEach(() => {
    process.env.CURSOR_API_KEY = originalEnv;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe("ListTools", () => {
    it("should return all tools", async () => {
      const response = await server._listToolsHandler({ params: {} });
      expect(response.tools.length).toBeGreaterThan(0);
      expect(response.tools.some(tool => tool.name === "start_cursor_agent")).toBe(true);
      expect(response.tools.some(tool => tool.name === "gh_repo_list")).toBe(true);
      expect(response.tools.some(tool => tool.name === "ask_openai")).toBe(true);
    });
  });

  describe("Tool handlers - happy paths", () => {
    it("should handle start_cursor_agent", async () => {
      process.env.CURSOR_API_KEY = "test-key";
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({
          id: "agent-123",
          name: "Test Agent",
          status: "running",
        }),
      });

      const response = await server._callToolHandler({
        params: {
          name: "start_cursor_agent",
          arguments: {
            repository_url: "https://github.com/owner/repo",
            prompt: "Test prompt",
          },
        },
      });

      expect(response.content).toBeDefined();
      expect(response.content[0].type).toBe("text");
    });

    it("should handle gh_repo_list", async () => {
      vi.spyOn(server.githubCLI, "listRepos").mockResolvedValue({
        content: [{ type: "text", text: "repo1\nrepo2\n" }],
      });

      const response = await server._callToolHandler({
        params: {
          name: "gh_repo_list",
          arguments: {},
        },
      });

      expect(response.content).toBeDefined();
    });

    it("should handle gh_repo_view", async () => {
      vi.spyOn(server.githubCLI, "viewRepo").mockResolvedValue({
        content: [{ type: "text", text: "Repository details" }],
      });

      const response = await server._callToolHandler({
        params: {
          name: "gh_repo_view",
          arguments: { repo: "envato/repo-name" },
        },
      });

      expect(response.content).toBeDefined();
    });

    it("should handle gh_pr_list", async () => {
      vi.spyOn(server.githubCLI, "listPRs").mockResolvedValue({
        content: [{ type: "text", text: "PR #1\n" }],
      });

      const response = await server._callToolHandler({
        params: {
          name: "gh_pr_list",
          arguments: {},
        },
      });

      expect(response.content).toBeDefined();
    });

    it("should handle gh_pr_view", async () => {
      vi.spyOn(server.githubCLI, "viewPR").mockResolvedValue({
        content: [{ type: "text", text: "PR #123 details" }],
      });

      const response = await server._callToolHandler({
        params: {
          name: "gh_pr_view",
          arguments: { pr_number: 123 },
        },
      });

      expect(response.content).toBeDefined();
    });

    it("should handle gh_search_code", async () => {
      vi.spyOn(server.githubCLI, "searchCode").mockResolvedValue({
        content: [{ type: "text", text: "search results" }],
      });

      const response = await server._callToolHandler({
        params: {
          name: "gh_search_code",
          arguments: { query: "function test" },
        },
      });

      expect(response.content).toBeDefined();
    });

    it("should handle gh_search_prs", async () => {
      vi.spyOn(server.githubCLI, "searchPRs").mockResolvedValue({
        content: [{ type: "text", text: "PR results" }],
      });

      const response = await server._callToolHandler({
        params: {
          name: "gh_search_prs",
          arguments: { query: "bug fix" },
        },
      });

      expect(response.content).toBeDefined();
    });

    it("should handle gh_search_commits", async () => {
      vi.spyOn(server.githubCLI, "searchCommits").mockResolvedValue({
        content: [{ type: "text", text: "commit results" }],
      });

      const response = await server._callToolHandler({
        params: {
          name: "gh_search_commits",
          arguments: { query: "initial commit" },
        },
      });

      expect(response.content).toBeDefined();
    });

    it("should handle ask_openai", async () => {
      vi.spyOn(server.openAIClient, "askOpenAI").mockResolvedValue({
        content: [{ type: "text", text: "OpenAI response" }],
      });

      const response = await server._callToolHandler({
        params: {
          name: "ask_openai",
          arguments: { prompt: "test prompt" },
        },
      });

      expect(response.content).toBeDefined();
    });

    it("should handle extract_cookies", async () => {
      vi.spyOn(server.browserClient, "extractCookies").mockResolvedValue({
        content: [{ type: "text", text: '{"token": "abc123"}' }],
      });

      const response = await server._callToolHandler({
        params: {
          name: "extract_cookies",
          arguments: {
            url: "https://example.com",
            waitForIndicators: ["Login"],
          },
        },
      });

      expect(response.content).toBeDefined();
    });

    it("should handle cultureamp_get_conversation", async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify({
            id: "0190791e-69f0-7057-939d-8bd02ca7b7b3",
            title: "Test Conversation",
            participants: {},
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify({ records: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify([]),
        });

      const response = await server._callToolHandler({
        params: {
          name: "cultureamp_get_conversation",
          arguments: {
            conversation_id: "0190791e-69f0-7057-939d-8bd02ca7b7b3",
            token: "test-token",
            refresh_token: "test-refresh-token",
          },
        },
      });

      expect(response.content).toBeDefined();
    });

    it("should handle fetch_page", async () => {
      vi.spyOn(server.browserClient, "fetchPage").mockResolvedValue({
        content: [{ type: "text", text: "Page content" }],
      });

      const response = await server._callToolHandler({
        params: {
          name: "fetch_page",
          arguments: {
            url: "https://example.com",
            waitForIndicators: ["Loaded"],
          },
        },
      });

      expect(response.content).toBeDefined();
    });
  });
});

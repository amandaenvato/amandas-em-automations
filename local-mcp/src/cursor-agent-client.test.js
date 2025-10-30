import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CursorAgentClient } from "./cursor-agent-client.js";

describe("CursorAgentClient", () => {
  let client;
  let originalFetch;
  let originalEnv;

  beforeEach(() => {
    client = new CursorAgentClient();
    originalFetch = global.fetch;
    originalEnv = process.env.CURSOR_API_KEY;
    // Clear env var by default for tests
    delete process.env.CURSOR_API_KEY;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.CURSOR_API_KEY = originalEnv;
    vi.restoreAllMocks();
  });

  describe("startAgent", () => {
    it("should throw error when api_key is missing and CURSOR_API_KEY env var is not set", async () => {
      await expect(
        client.startAgent({
          repository_url: "https://github.com/owner/repo",
          prompt: "Test prompt",
        })
      ).rejects.toThrow("CURSOR_API_KEY environment variable is required");
    });

    it("should throw error when repository_url is missing", async () => {
      process.env.CURSOR_API_KEY = "test-key";
      await expect(
        client.startAgent({
          prompt: "Test prompt",
        })
      ).rejects.toThrow("repository_url is required");
    });

    it("should throw error when prompt is missing", async () => {
      process.env.CURSOR_API_KEY = "test-key";
      await expect(
        client.startAgent({
          repository_url: "https://github.com/owner/repo",
        })
      ).rejects.toThrow("prompt is required");
    });

    it("should use CURSOR_API_KEY env var", async () => {
      process.env.CURSOR_API_KEY = "env-key";
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({
          id: "agent-123",
          name: "Test Agent",
          status: "running",
        }),
      });
      global.fetch = mockFetch;

      await client.startAgent({
        repository_url: "https://github.com/owner/repo",
        prompt: "Test prompt",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cursor.com/v0/agents",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer env-key",
          }),
        })
      );
    });

    it("should make POST request with correct body", async () => {
      process.env.CURSOR_API_KEY = "test-key";
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({
          id: "agent-123",
          name: "Test Agent",
          status: "running",
        }),
      });
      global.fetch = mockFetch;

      await client.startAgent({
        repository_url: "https://github.com/owner/repo",
        prompt: "Test prompt",
        branch_name: "feature-branch",
        agent_name: "My Agent",
        auto_create_pull_request: true,
        model: "composer-1",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cursor.com/v0/agents",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-key",
          },
          body: JSON.stringify({
            source: {
              repository: "https://github.com/owner/repo",
            },
            prompt: {
              text: "Test prompt",
            },
            branch: "feature-branch",
            model: "composer-1",
          }),
        })
      );
    });

    it("should use default values for optional parameters", async () => {
      process.env.CURSOR_API_KEY = "test-key";
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({
          id: "agent-123",
          status: "running",
        }),
      });
      global.fetch = mockFetch;

      await client.startAgent({
        repository_url: "https://github.com/owner/repo",
        prompt: "Test prompt",
      });

      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.model).toBe("composer-1");
      expect(body.branch).toBeUndefined();
      expect(body.source.repository).toBe("https://github.com/owner/repo");
      expect(body.prompt.text).toBe("Test prompt");
      // These fields are no longer sent in the API request
      expect(body.auto_create_pull_request).toBeUndefined();
      expect(body.agent_name).toBeUndefined();
      expect(body.repository_url).toBeUndefined();
    });

    it("should return success response with correct format", async () => {
      process.env.CURSOR_API_KEY = "test-key";
      const mockResponse = {
        id: "agent-123",
        name: "Test Agent",
        status: "running",
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockResponse),
      });
      global.fetch = mockFetch;

      const result = await client.startAgent({
        repository_url: "https://github.com/owner/repo",
        prompt: "Test prompt",
        agent_name: "Test Agent",
        branch_name: "main",
      });

      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: expect.stringContaining("Cursor Agent Started Successfully"),
          },
        ],
      });
      expect(result.content[0].text).toContain("agent-123");
      expect(result.content[0].text).toContain("Test Agent");
      expect(result.content[0].text).toContain("https://github.com/owner/repo");
      expect(result.content[0].text).toContain("main");
      expect(result.content[0].text).toContain("running");
      expect(result.content[0].text).toContain("composer-1");
      expect(result.content[0].text).toContain('Test prompt');
    });

    it("should handle API error responses", async () => {
      process.env.CURSOR_API_KEY = "test-key";
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: async () => JSON.stringify({
          error: {
            message: "Invalid repository URL",
          },
        }),
      });
      global.fetch = mockFetch;

      const result = await client.startAgent({
        repository_url: "https://github.com/owner/repo",
        prompt: "Test prompt",
      });

      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: "Error starting Cursor agent: Cursor API error (400): Invalid repository URL",
          },
        ],
        isError: true,
      });
    });

    it("should handle network errors", async () => {
      process.env.CURSOR_API_KEY = "test-key";
      const mockFetch = vi.fn().mockRejectedValue(
        new Error("Network error")
      );
      global.fetch = mockFetch;

      const result = await client.startAgent({
        repository_url: "https://github.com/owner/repo",
        prompt: "Test prompt",
      });

      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: "Error starting Cursor agent: Network error",
          },
        ],
        isError: true,
      });
    });

    it("should handle API error without error message", async () => {
      process.env.CURSOR_API_KEY = "test-key";
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => JSON.stringify({}),
      });
      global.fetch = mockFetch;

      const result = await client.startAgent({
        repository_url: "https://github.com/owner/repo",
        prompt: "Test prompt",
      });

      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: "Error starting Cursor agent: Cursor API error (500): Internal Server Error",
          },
        ],
        isError: true,
      });
    });

    it("should handle non-JSON error responses", async () => {
      process.env.CURSOR_API_KEY = "test-key";
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => "Internal Server Error - Plain text response",
      });
      global.fetch = mockFetch;

      const result = await client.startAgent({
        repository_url: "https://github.com/owner/repo",
        prompt: "Test prompt",
      });

      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: "Error starting Cursor agent: Cursor API error: 500 Internal Server Error. Response: Internal Server Error - Plain text response",
          },
        ],
        isError: true,
      });
    });
  });
});


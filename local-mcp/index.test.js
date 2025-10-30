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

  describe("initialization", () => {
    it("should create server instance with cursorAgentClient", () => {
      expect(server).toBeDefined();
      expect(server.cursorAgentClient).toBeDefined();
      expect(server.server).toBeDefined();
    });
  });

  describe("ListTools handler", () => {
    it("should return start_cursor_agent tool in tools list", async () => {
      const request = {
        params: {},
      };

      const handler = server._listToolsHandler;
      expect(handler).toBeDefined();

      const response = await handler(request);

      expect(response.tools).toHaveLength(1);
      expect(response.tools[0]).toMatchObject({
        name: "start_cursor_agent",
        description: expect.stringContaining("Cursor agent"),
        inputSchema: {
          type: "object",
          properties: expect.objectContaining({
            repository_url: expect.any(Object),
            prompt: expect.any(Object),
          }),
          required: ["repository_url", "prompt"],
        },
      });
    });

    it("should have correct tool schema properties", async () => {
      const request = { params: {} };
      const handler = server._listToolsHandler;
      const response = await handler(request);
      const schema = response.tools[0].inputSchema;

      expect(schema.properties.repository_url).toMatchObject({
        type: "string",
        description: expect.stringContaining("GitHub repository"),
      });
      expect(schema.properties.prompt).toMatchObject({
        type: "string",
        description: expect.any(String),
      });
      expect(schema.properties.branch_name).toMatchObject({
        type: "string",
        description: expect.any(String),
      });
      expect(schema.properties.agent_name).toMatchObject({
        type: "string",
        description: expect.any(String),
      });
      expect(schema.properties.auto_create_pull_request).toMatchObject({
        type: "boolean",
        description: expect.any(String),
        default: false,
      });
      expect(schema.properties.model).toMatchObject({
        type: "string",
        description: expect.any(String),
        default: "composer-1",
      });
      expect(schema.required).toEqual(["repository_url", "prompt"]);
    });
  });

  describe("CallTool handler", () => {
    it("should call startAgent for start_cursor_agent tool", async () => {
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

      const request = {
        params: {
          name: "start_cursor_agent",
          arguments: {
            repository_url: "https://github.com/owner/repo",
            prompt: "Test prompt",
          },
        },
      };

      const handler = server._callToolHandler;
      const response = await handler(request);

      expect(mockFetch).toHaveBeenCalled();
      expect(response.content).toBeDefined();
      expect(response.content[0].type).toBe("text");
      expect(response.content[0].text).toContain("Cursor Agent Started Successfully");
    });

    it("should throw error for unknown tool", async () => {
      const request = {
        params: {
          name: "unknown_tool",
          arguments: {},
        },
      };

      const handler = server._callToolHandler;

      await expect(handler(request)).rejects.toThrow("Unknown tool: unknown_tool");
    });

    it("should handle missing arguments gracefully", async () => {
      process.env.CURSOR_API_KEY = "test-key";
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({
          id: "agent-123",
          status: "running",
        }),
      });
      global.fetch = mockFetch;

      const request = {
        params: {
          name: "start_cursor_agent",
          arguments: null,
        },
      };

      const handler = server._callToolHandler;

      // Should propagate validation errors from CursorAgentClient
      await expect(handler(request)).rejects.toThrow();
    });

    it("should pass all arguments to startAgent", async () => {
      process.env.CURSOR_API_KEY = "test-key";
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({
          id: "agent-123",
          name: "Custom Agent",
          status: "running",
        }),
      });
      global.fetch = mockFetch;

      const request = {
        params: {
          name: "start_cursor_agent",
          arguments: {
            repository_url: "https://github.com/owner/repo",
            prompt: "Test prompt",
            branch_name: "feature-branch",
            agent_name: "Custom Agent",
            auto_create_pull_request: true,
            model: "composer-1",
          },
        },
      };

      const handler = server._callToolHandler;
      await handler(request);

      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.source.repository).toBe("https://github.com/owner/repo");
      expect(body.prompt.text).toBe("Test prompt");
      expect(body.branch).toBe("feature-branch");
      expect(body.model).toBe("composer-1");
      // These fields are no longer sent in the API request
      expect(body.repository_url).toBeUndefined();
      expect(body.agent_name).toBeUndefined();
      expect(body.auto_create_pull_request).toBeUndefined();
    });
  });
});

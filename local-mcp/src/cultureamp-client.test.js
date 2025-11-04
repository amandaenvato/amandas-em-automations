import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CultureAmpClient } from "./cultureamp-client.js";

// Mock global fetch
global.fetch = vi.fn();

describe("CultureAmpClient", () => {
  let client;
  let originalEnv;

  beforeEach(() => {
    originalEnv = {
      CULTUREAMP_TOKEN: process.env.CULTUREAMP_TOKEN,
      CULTUREAMP_REFRESH_TOKEN: process.env.CULTUREAMP_REFRESH_TOKEN,
      CULTUREAMP_BASE_URL: process.env.CULTUREAMP_BASE_URL,
    };

    // Set required env vars for tests
    process.env.CULTUREAMP_TOKEN = "test-token";
    process.env.CULTUREAMP_REFRESH_TOKEN = "test-refresh-token";
    process.env.CULTUREAMP_BASE_URL = "https://test.cultureamp.com";

    client = new CultureAmpClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original env
    process.env.CULTUREAMP_TOKEN = originalEnv.CULTUREAMP_TOKEN;
    process.env.CULTUREAMP_REFRESH_TOKEN = originalEnv.CULTUREAMP_REFRESH_TOKEN;
    process.env.CULTUREAMP_BASE_URL = originalEnv.CULTUREAMP_BASE_URL;
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with default base URL when not provided", () => {
      delete process.env.CULTUREAMP_BASE_URL;
      const testClient = new CultureAmpClient();
      expect(testClient.baseUrl).toBe("https://envato.cultureamp.com");
    });

    it("should use custom base URL from env", () => {
      process.env.CULTUREAMP_BASE_URL = "https://custom.cultureamp.com";
      const testClient = new CultureAmpClient();
      expect(testClient.baseUrl).toBe("https://custom.cultureamp.com");
    });

    it("should throw error when CULTUREAMP_TOKEN is missing", () => {
      delete process.env.CULTUREAMP_TOKEN;
      expect(() => new CultureAmpClient()).toThrow("Culture Amp authentication required");
    });

    it("should throw error when CULTUREAMP_REFRESH_TOKEN is missing", () => {
      delete process.env.CULTUREAMP_REFRESH_TOKEN;
      expect(() => new CultureAmpClient()).toThrow("Culture Amp authentication required");
    });

    it("should build cookies string correctly", () => {
      expect(client.cookies).toBe("cultureamp.production-us.token=test-token; cultureamp.production-us.refresh-token=test-refresh-token");
    });
  });

  describe("getConversation", () => {
    const validConversationId = "0190791e-69f0-7057-939d-8bd02ca7b7b3";

    it("should throw error when conversationId is missing", async () => {
      await expect(client.getConversation()).rejects.toThrow("conversationId is required");
    });

    it("should throw error when conversationId is empty string", async () => {
      await expect(client.getConversation("")).rejects.toThrow("conversationId is required");
    });

    it("should throw error for invalid UUID format", async () => {
      await expect(client.getConversation("invalid-id")).rejects.toThrow("Invalid conversation ID format");
    });

    it("should fetch conversation data successfully", async () => {
      const mockConversationData = {
        id: validConversationId,
        title: "Test Conversation",
        participants: {
          "user1": { name: "John", email: "john@example.com" },
          "user2": { name: "Jane", email: "jane@example.com" },
        },
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      };

      const mockTopicsData = {
        records: [
          {
            id: "topic1",
            type: "highlight",
            title: "Test Topic",
            created_at: "2024-01-01T00:00:00Z",
            completed_at: "2024-01-02T00:00:00Z",
          },
        ],
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify(mockConversationData),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify(mockTopicsData),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify([]),
        });

      const result = await client.getConversation(validConversationId);

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("Test Conversation");
      expect(result.content[0].text).toContain("John");
      expect(result.content[0].text).toContain("Jane");
      expect(global.fetch).toHaveBeenCalledTimes(3); // conversation, topics, attachments
    });

    it("should handle topics endpoint failure gracefully", async () => {
      const mockConversationData = {
        id: validConversationId,
        title: "Test Conversation",
        participants: {},
        created_at: "2024-01-01T00:00:00Z",
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify(mockConversationData),
        })
        .mockRejectedValueOnce(new Error("Topics endpoint failed"));

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await client.getConversation(validConversationId);

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain("Test Conversation");
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Failed to fetch completed topics"));
      
      consoleSpy.mockRestore();
    });

    it("should handle different topic response structures", async () => {
      const mockConversationData = {
        id: validConversationId,
        title: "Test",
        participants: {},
      };

      // Test with records structure
      const mockTopicsRecords = { records: [{ id: "topic1", type: "highlight" }] };
      
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify(mockConversationData),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify(mockTopicsRecords),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify([]),
        });

      const result = await client.getConversation(validConversationId);
      expect(result.content[0].text).toContain("Completed Topics");
    });

    it("should handle attachment fetch failures gracefully", async () => {
      const mockConversationData = {
        id: validConversationId,
        title: "Test",
        participants: {},
      };

      const mockTopicsData = {
        records: [
          {
            id: "topic1",
            type: "highlight",
            title: "Test Topic",
          },
        ],
      };

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify(mockConversationData),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify(mockTopicsData),
        })
        .mockRejectedValueOnce(new Error("Attachments failed"));

      const result = await client.getConversation(validConversationId);

      expect(result.content).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Failed to fetch attachments"));
      
      consoleSpy.mockRestore();
    });

    it("should handle API errors correctly", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => JSON.stringify({ error: { message: "Invalid token" } }),
      });

      const result = await client.getConversation(validConversationId);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Error fetching Culture Amp conversation");
      expect(result.content[0].text).toContain("Invalid token");
    });

    it("should handle non-JSON error responses", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => "Internal Server Error",
      });

      const result = await client.getConversation(validConversationId);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Error fetching Culture Amp conversation");
    });

    it("should fetch attachments for each topic", async () => {
      const mockConversationData = {
        id: validConversationId,
        title: "Test",
        participants: {},
      };

      const mockTopicsData = {
        records: [
          {
            id: "topic1",
            type: "highlight",
            title: "Topic 1",
          },
          {
            id: "topic2",
            type: "challenge",
            title: "Topic 2",
          },
        ],
      };

      const mockAttachments1 = [
        {
          id: "attach1",
          attachable_type: "Note",
          content: '[{"type":"paragraph","content":[{"type":"text","text":"Test note"}]}]',
          created_at: "2024-01-01T00:00:00Z",
        },
      ];

      const mockAttachments2 = [
        {
          id: "attach2",
          attachable_type: "Response",
          content: '[{"type":"paragraph","content":[{"type":"text","text":"Test response"}]}]',
          created_at: "2024-01-02T00:00:00Z",
        },
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify(mockConversationData),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify(mockTopicsData),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify(mockAttachments1),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify(mockAttachments2),
        });

      const result = await client.getConversation(validConversationId);

      expect(result.content[0].text).toContain("Topic 1");
      expect(result.content[0].text).toContain("Topic 2");
      expect(global.fetch).toHaveBeenCalledTimes(4); // conversation, topics, 2 attachments
    });

    it("should handle topics without IDs", async () => {
      const mockConversationData = {
        id: validConversationId,
        title: "Test",
        participants: {},
      };

      const mockTopicsData = {
        records: [
          {
            type: "highlight",
            title: "Topic without ID",
            // No id field
          },
        ],
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify(mockConversationData),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify(mockTopicsData),
        });

      const result = await client.getConversation(validConversationId);

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain("Topic without ID");
      // Should not try to fetch attachments for topic without ID
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("formatFileSize", () => {
    it("should format bytes correctly", () => {
      expect(client.formatFileSize(0)).toBe("0 B");
      expect(client.formatFileSize(1024)).toBe("1 KB");
      expect(client.formatFileSize(1048576)).toBe("1 MB");
      expect(client.formatFileSize(1073741824)).toBe("1 GB");
    });

    it("should handle undefined/null", () => {
      expect(client.formatFileSize(undefined)).toBe("0 B");
      expect(client.formatFileSize(null)).toBe("0 B");
    });
  });

  describe("formatConversation", () => {
    it("should format conversation with summary section", () => {
      const data = {
        id: "test-id",
        title: "Test Conversation",
        participants: {
          "user1": { name: "John", email: "john@example.com" },
        },
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        completed_topics: [
          { type: "highlight", id: "topic1" },
          { type: "challenge", id: "topic2" },
        ],
      };

      const result = client.formatConversation(data);

      expect(result).toContain("# Culture Amp Conversation");
      expect(result).toContain("## Summary");
      expect(result).toContain("Test Conversation");
      expect(result).toContain("test-id");
      expect(result).toContain("John");
      expect(result).toContain("**Completed Topics**: 2");
      expect(result).toContain("highlight: 1, challenge: 1");
    });

    it("should format completed topics with attachments", () => {
      const data = {
        id: "test-id",
        title: "Test",
        participants: {},
        completed_topics: [
          {
            id: "topic1",
            type: "highlight",
            title: "Test Topic",
            created_at: "2024-01-01T00:00:00Z",
            completed_at: "2024-01-02T00:00:00Z",
            attachments: [
              {
                attachable_type: "Note",
                content: '[{"type":"paragraph","content":[{"type":"text","text":"Test note content"}]}]',
                created_at: "2024-01-01T00:00:00Z",
              },
            ],
          },
        ],
      };

      const result = client.formatConversation(data);

      expect(result).toContain("Test Topic");
      expect(result).toContain("[Note]");
      expect(result).toContain("Test note content");
    });

    it("should handle topics without attachments", () => {
      const data = {
        id: "test-id",
        title: "Test",
        participants: {},
        completed_topics: [
          {
            id: "topic1",
            type: "action",
            title: "Action Topic",
          },
        ],
      };

      const result = client.formatConversation(data);

      expect(result).toContain("Action Topic");
      expect(result).toContain("action");
    });
  });
});


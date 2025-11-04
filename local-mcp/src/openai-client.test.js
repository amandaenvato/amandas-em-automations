import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenAIClient } from "./openai-client.js";

// Mock the OpenAI module
vi.mock("openai", () => {
  return {
    default: vi.fn().mockImplementation((config) => {
      return {
        chat: {
          completions: {
            create: vi.fn(),
          },
        },
      };
    }),
  };
});

describe("OpenAIClient", () => {
  let client;
  let originalEnv;
  let mockOpenAI;
  let mockCreate;

  beforeEach(async () => {
    originalEnv = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    // Import OpenAI after clearing env to get fresh mock
    const OpenAI = (await import("openai")).default;
    mockOpenAI = vi.mocked(OpenAI);

    // Create a fresh client instance
    const { OpenAIClient } = await import("./openai-client.js");
    client = new OpenAIClient();

    // Get the mock create function from the instance
    if (client.client) {
      mockCreate = vi.mocked(client.client.chat.completions.create);
    }
  });

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalEnv;
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize client when OPENAI_API_KEY is set", async () => {
      process.env.OPENAI_API_KEY = "test-key";
      const { OpenAIClient } = await import("./openai-client.js");
      const testClient = new OpenAIClient();

      expect(testClient.client).toBeTruthy();
      expect(testClient.apiKey).toBe("test-key");
    });

    it("should not initialize client when OPENAI_API_KEY is missing", async () => {
      delete process.env.OPENAI_API_KEY;
      const { OpenAIClient } = await import("./openai-client.js");
      const testClient = new OpenAIClient();

      expect(testClient.client).toBeNull();
      expect(testClient.apiKey).toBeUndefined();
    });
  });

  describe("askOpenAI", () => {
    beforeEach(async () => {
      // Set up API key and recreate client for tests that need it
      process.env.OPENAI_API_KEY = "test-key";
      const { OpenAIClient } = await import("./openai-client.js");
      client = new OpenAIClient();
      mockCreate = vi.mocked(client.client.chat.completions.create);
    });

    it("should return error when prompt is missing", async () => {
      const result = await client.askOpenAI({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("prompt parameter is required");
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("should return error when prompt is empty string", async () => {
      const result = await client.askOpenAI({ prompt: "" });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("prompt parameter is required");
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("should return error when OPENAI_API_KEY is not set", async () => {
      delete process.env.OPENAI_API_KEY;
      const { OpenAIClient } = await import("./openai-client.js");
      const testClient = new OpenAIClient();

      const result = await testClient.askOpenAI({ prompt: "test prompt" });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("OPENAI_API_KEY environment variable is required");
    });

    it("should call OpenAI API with correct parameters", async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: "Test response",
            },
          },
        ],
      });

      await client.askOpenAI({ prompt: "test prompt" });

      expect(mockCreate).toHaveBeenCalledWith({
        model: "gpt-5-nano",
        messages: [
          {
            role: "user",
            content: "test prompt",
          },
        ],
      });
    });

    it("should use default model", async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: "Test response",
            },
          },
        ],
      });

      await client.askOpenAI({ prompt: "test prompt" });

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.model).toBe("gpt-5-nano");
      expect(callArgs.temperature).toBeUndefined();
      expect(callArgs.max_tokens).toBeUndefined();
    });

    it("should return success response with correct format", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "This is a test response from OpenAI",
            },
          },
        ],
      };
      mockCreate.mockResolvedValue(mockResponse);

      const result = await client.askOpenAI({ prompt: "test prompt" });

      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: "This is a test response from OpenAI",
          },
        ],
      });
      expect(result.isError).toBeUndefined();
    });

    it("should handle response with no content", async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {},
          },
        ],
      });

      const result = await client.askOpenAI({ prompt: "test prompt" });

      expect(result.content[0].text).toBe("No response received");
    });

    it("should handle response with empty choices array", async () => {
      mockCreate.mockResolvedValue({
        choices: [],
      });

      const result = await client.askOpenAI({ prompt: "test prompt" });

      expect(result.content[0].text).toBe("No response received");
    });

    it("should handle API errors", async () => {
      const error = new Error("API rate limit exceeded");
      mockCreate.mockRejectedValue(error);

      const result = await client.askOpenAI({ prompt: "test prompt" });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe("Error calling OpenAI API: API rate limit exceeded");
    });

    it("should handle network errors", async () => {
      const error = new Error("Network error");
      mockCreate.mockRejectedValue(error);

      const result = await client.askOpenAI({ prompt: "test prompt" });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe("Error calling OpenAI API: Network error");
    });

    it("should handle authentication errors", async () => {
      const error = new Error("Invalid API key");
      mockCreate.mockRejectedValue(error);

      const result = await client.askOpenAI({ prompt: "test prompt" });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe("Error calling OpenAI API: Invalid API key");
    });

    it("should use custom model when provided", async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: "Custom response",
            },
          },
        ],
      });

      await client.askOpenAI({
        prompt: "What is the meaning of life?",
        model: "gpt-3.5-turbo",
      });

      expect(mockCreate).toHaveBeenCalledWith({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: "What is the meaning of life?",
          },
        ],
      });
    });
  });
});


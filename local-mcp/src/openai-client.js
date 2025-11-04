import OpenAI from "openai";

export class OpenAIClient {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.client = null;

    if (this.apiKey) {
      this.client = new OpenAI({
        apiKey: this.apiKey,
      });
    }
  }

  /**
   * Ask OpenAI a question and wait for the response
   * @param {Object} params - Parameters for the OpenAI request
   * @param {string} params.prompt - The prompt/question to send to OpenAI
   * @param {string} [params.model] - The model to use (default: 'gpt-5-nano')
   * @returns {Promise<Object>} Response object with content
   */
  async askOpenAI({ prompt, model = "gpt-5-nano" }) {
    if (!prompt) {
      return {
        content: [
          {
            type: "text",
            text: "Error: prompt parameter is required",
          },
        ],
        isError: true,
      };
    }

    if (!this.client) {
      return {
        content: [
          {
            type: "text",
            text: "Error: OPENAI_API_KEY environment variable is required. Set it with your OpenAI API key.",
          },
        ],
        isError: true,
      };
    }

    try {
      const params = {
        model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      };

      const completion = await this.client.chat.completions.create(params);

      const responseText = completion.choices[0]?.message?.content || "No response received";

      return {
        content: [
          {
            type: "text",
            text: responseText,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error calling OpenAI API: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
}


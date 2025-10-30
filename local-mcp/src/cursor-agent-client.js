export class CursorAgentClient {
  async startAgent(params) {
    const {
      repository_url,
      prompt,
      branch_name,
      agent_name,
      auto_create_pull_request = false,
      model = "composer-1",
    } = params;

    const api_key = process.env.CURSOR_API_KEY;

    if (!api_key) {
      throw new Error(
        "CURSOR_API_KEY environment variable is required. Get your API key from https://cursor.com/dashboard"
      );
    }

    if (!repository_url) {
      throw new Error("repository_url is required");
    }

    if (!prompt) {
      throw new Error("prompt is required");
    }

    try {
      const response = await fetch("https://api.cursor.com/v0/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${api_key}`,
        },
        body: JSON.stringify({
          source: {
            repository: repository_url,
          },
          prompt: {
            text: prompt,
          },
          branch: branch_name || undefined,
          model,
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(
          `Cursor API error: ${response.status} ${response.statusText}. Response: ${text}`
        );
      }

      if (!response.ok) {
        const errorMsg = data.error?.message || data.message || response.statusText;
        const errorDetails = data.error?.details || data.details || '';
        throw new Error(
          `Cursor API error (${response.status}): ${errorMsg}${errorDetails ? ` - ${JSON.stringify(errorDetails)}` : ''}`
        );
      }

      return {
        content: [
          {
            type: "text",
            text: `# Cursor Agent Started Successfully\n\n` +
                  `**Agent ID**: ${data.id || "N/A"}\n` +
                  `**Name**: ${data.name || agent_name || "N/A"}\n` +
                  `**Repository**: ${repository_url}\n` +
                  `**Branch**: ${branch_name || "default"}\n` +
                  `**Status**: ${data.status || "started"}\n` +
                  `**Model**: ${model}\n\n` +
                  `The agent is now processing your prompt: "${prompt}"`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error starting Cursor agent: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
}


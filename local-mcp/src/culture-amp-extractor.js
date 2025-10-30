export class CultureAmpNotesExtractor {
  constructor(playwrightClient) {
    this.playwrightClient = playwrightClient;
  }

  async extractNotes(cultureAmpId, baseUrl = "https://envato.cultureamp.com") {
    try {
      const url = `${baseUrl}/app/conversations/${cultureAmpId}?tab=history`;

      console.error('Using Playwright MCP to navigate to:', url);

      // Navigate using Playwright MCP
      const navigateResult = await this.playwrightClient.callTool('browser_navigate', {
        url: url
      });

      console.error('Navigate result:', navigateResult);

      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Find and click all "Show notes" buttons (Chat_Bubble buttons) using JavaScript
      const clickScript = `() => [...document.querySelectorAll('button')].filter(btn => [...btn.querySelectorAll('span')].some(span => span.textContent.trim() === 'Chat_Bubble')).forEach(btn => btn.click())`;

      console.error('Clicking all Chat_Bubble buttons');
      const clickResult = await this.playwrightClient.callTool('browser_evaluate', {
        function: clickScript
      });
      console.error('Click result:', clickResult);

      // Wait for the content to load
      console.error('Waiting for content to load...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Extract all text from the page
      console.error('Extracting page text...');
      const textResult = await this.playwrightClient.callTool('browser_evaluate', {
        function: '() => document.body.innerText.toString()'
      });
      console.error('Text result:', textResult);

      // Extract the text content from the result
      const pageText = textResult.result?.content?.[0]?.text || '';
      console.error('Parsed result:', pageText);


      return {
        content: [
          {
            type: "text",
            text: `# Culture Amp Notes for ID: ${cultureAmpId}\n\n` +
                  `**URL**: ${url}\n\n` +
                  `**Extracted Content**:\n\`\`\`\n${pageText}\n\`\`\``
          }
        ]
      };

    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error extracting Culture Amp notes: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  findShowNotesButtons(snapshotResult) {
    try {
      const snapshotText = snapshotResult.result?.content?.[0]?.text || '';

      // Look for button elements with "Show note" or "Show notes" text
      const buttonPattern = /button.*?"Show notes? (?:for|of) .*?" \[ref=([^\]]+)\]/gi;
      const matches = [];
      let match;

      while ((match = buttonPattern.exec(snapshotText)) !== null) {
        matches.push({
          ref: match[1],
          description: match[0]
        });
      }

      console.error(`Found ${matches.length} "Show notes" buttons in snapshot`);
      return matches;
    } catch (error) {
      console.error('Error finding buttons:', error.message);
      return [];
    }
  }

  extractTextFromSnapshot(snapshotResult) {
    try {
      const snapshotText = snapshotResult.result?.content?.[0]?.text || '';

      // Extract all visible text from the snapshot
      // The snapshot is in YAML format, so we'll extract text between quotes
      const textPattern = /"([^"]+)"(?=\s*\[)/g;
      const matches = [];
      let match;

      while ((match = textPattern.exec(snapshotText)) !== null) {
        matches.push(match[1]);
      }

      return matches.join('\n');
    } catch (error) {
      console.error('Error extracting text:', error.message);
      return snapshotResult.result?.content?.[0]?.text || JSON.stringify(snapshotResult, null, 2);
    }
  }
}


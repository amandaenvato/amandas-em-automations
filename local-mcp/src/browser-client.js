import { chromium } from "playwright";
import { setTimeout } from "timers/promises";
import { homedir } from "os";
import { join } from "path";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";

export class BrowserClient {
  constructor() {
    this.userDataDir = process.env.CULTUREAMP_BROWSER_DATA_DIR || join(
      homedir(),
      ".local-mcp",
      "cultureamp-browser-data"
    );
    this.storageStatePath = join(this.userDataDir, "storage-state.json");
  }

  async cleanup(context, browser) {
    await Promise.allSettled([
      context?.close(),
      browser?.close(),
    ]);
  }

  async extractCultureAmpTokens() {
    let browser = null;
    let context = null;
    let page = null;

    try {
      await mkdir(this.userDataDir, { recursive: true });

      browser = await chromium.launch({ headless: false });
      context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        ...(existsSync(this.storageStatePath) && { storageState: this.storageStatePath }),
      });

      page = await context.newPage();
      await page.goto("https://envato.cultureamp.com/app/home", {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // Wait for login confirmation (looks for "JW" in page text)
      const hasExistingToken = (await context.cookies()).some(
        (c) => c.name === "cultureamp.production-us.token"
      );
      const maxWaitTime = hasExistingToken ? 10000 : 40000;
      const startTime = Date.now();
      let loggedIn = false;

      while (Date.now() - startTime < maxWaitTime) {
        const pageText = await page.evaluate(
          () => document.body.innerText || document.body.textContent || ""
        );
        if (/\bJW\b/.test(pageText)) {
          loggedIn = true;
          break;
        }
        await setTimeout(500);
      }

      if (!loggedIn) {
        throw new Error(
          `Timeout waiting for login confirmation (waited ${maxWaitTime / 1000}s for 'JW' to appear). ` +
          "Please log into Culture Amp in your browser and try again."
        );
      }

      const cookies = await context.cookies();
      const tokenCookie = cookies.find((c) => c.name === "cultureamp.production-us.token");
      const refreshTokenCookie = cookies.find(
        (c) => c.name === "cultureamp.production-us.refresh-token"
      );

      if (!tokenCookie || !refreshTokenCookie) {
        throw new Error(
          "Could not find Culture Amp authentication cookies. " +
          "Please log into Culture Amp in the browser window, then try again."
        );
      }

      await context.storageState({ path: this.storageStatePath });
      await this.cleanup(context, browser);

      return {
        content: [
          {
            type: "text",
            text: `# Culture Amp Authentication Tokens\n\nSuccessfully extracted authentication tokens.\n\n**Token**: ${tokenCookie.value.substring(0, 50)}...\n**Refresh Token**: ${refreshTokenCookie.value.substring(0, 50)}...\n\n## Tokens (JSON)\n\n\`\`\`json\n${JSON.stringify({ token: tokenCookie.value, refresh_token: refreshTokenCookie.value }, null, 2)}\n\`\`\`\n\nUse these tokens with the \`cultureamp_get_conversation\` tool.`,
          },
        ],
      };
    } catch (error) {
      await this.cleanup(context, browser);
      return {
        content: [
          {
            type: "text",
            text: `Error extracting Culture Amp tokens: ${error.message}\n\nMake sure you are logged into Culture Amp in the browser window.`,
          },
        ],
        isError: true,
      };
    }
  }

}

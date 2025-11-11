import { chromium } from "playwright";
import { spawn } from "child_process";
import { setTimeout } from "timers/promises";
import { homedir } from "os";
import { join } from "path";

export class BrowserClient {
  constructor() {
    this.bravePath = process.env.BRAVE_BROWSER_PATH || "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";
    this.cdpEndpoint = process.env.BRAVE_CDP_ENDPOINT || "http://localhost:9222";
    this.cdpPort = 9222;
    this.userDataDir = process.env.BRAVE_USER_DATA_DIR || join(
      homedir(),
      "Library/Application Support/BraveSoftware/Brave-Browser"
    );
  }

  /**
   * Check if CDP endpoint is available
   * @private
   */
  async checkCDPAvailable() {
    try {
      const response = await fetch(`${this.cdpEndpoint}/json/version`, {
        signal: AbortSignal.timeout(1000)
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for CDP endpoint to become ready
   * @private
   */
  async waitForCDPReady(maxAttempts = 20, delayMs = 500) {
    for (let i = 0; i < maxAttempts; i++) {
      if (await this.checkCDPAvailable()) {
        return;
      }
      await setTimeout(delayMs);
    }
    throw new Error(
      `CDP endpoint not ready after ${maxAttempts * delayMs}ms. ` +
      `If Brave is already running, you may need to close it first or start it manually with --remote-debugging-port=${this.cdpPort}`
    );
  }

  /**
   * Launch Brave browser with CDP enabled
   * @private
   */
  async launchBrave() {
    const browserProcess = spawn(this.bravePath, [
      `--remote-debugging-port=${this.cdpPort}`,
      `--user-data-dir=${this.userDataDir}`,
      "--no-first-run",
      "--no-default-browser-check",
    ], {
      detached: false,
      stdio: "ignore",
    });

    browserProcess.on("error", (error) => {
      throw new Error(
        `Failed to start Brave browser: ${error.message}. ` +
        `Make sure Brave is installed at ${this.bravePath}`
      );
    });

    await this.waitForCDPReady();
    return browserProcess;
  }

  /**
   * Extract text content from page
   * @private
   */
  async extractPageContent(page) {
    const title = await page.title();
    const currentUrl = page.url();

    const textContent = await page.evaluate(() => {
      const scripts = document.querySelectorAll("script, style");
      scripts.forEach((el) => el.remove());
      return document.body.innerText || document.body.textContent || "";
    });

    const html = await page.content();

    return { title, currentUrl, textContent, html };
  }

  /**
   * Clean up browser resources
   * @private
   */
  async cleanup(browser, browserProcess) {
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    if (browserProcess && !browserProcess.killed && browserProcess.exitCode === null) {
      try {
        browserProcess.kill();
        await setTimeout(500);
        if (!browserProcess.killed && browserProcess.exitCode === null) {
          browserProcess.kill("SIGKILL");
        }
      } catch (error) {
        // Process may have already exited, ignore
      }
    }
  }

  /**
   * Launch Brave browser with CDP enabled, navigate to a URL, and return page content
   * @param {string} url - The URL to navigate to
   * @returns {Promise<Object>} Page content formatted for MCP response
   */
  async navigateAndGetContent(url) {
    let browserProcess = null;
    let browser = null;
    let page = null;

    try {
      // Check if CDP is already available, otherwise launch Brave
      if (!(await this.checkCDPAvailable())) {
        browserProcess = await this.launchBrave();
      }

      // Connect to browser via CDP
      browser = await chromium.connectOverCDP(this.cdpEndpoint);

      // Use existing context or create new one
      const contexts = browser.contexts();
      const context = contexts.length > 0 ? contexts[0] : await browser.newContext();

      // Create page and navigate
      page = await context.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(2000); // Wait for dynamic content

      // Extract content
      const { title, currentUrl, textContent, html } = await this.extractPageContent(page);

      // Close page
      try {
        await page.close();
      } catch (error) {
        // Ignore close errors
      }

      // Cleanup
      await this.cleanup(browser, browserProcess);

      return {
        content: [
          {
            type: "text",
            text: `# Page Content\n\n**URL**: ${currentUrl}\n**Title**: ${title}\n\n## Visible Text Content\n\n${textContent}\n\n## HTML Source\n\n\`\`\`html\n${html.substring(0, 50000)}\n\`\`\`\n`,
          },
        ],
      };
    } catch (error) {
      // Cleanup on error
      if (page) {
        try {
          await page.close();
        } catch (error) {
          // Ignore
        }
      }
      await this.cleanup(browser, browserProcess);

      return {
        content: [
          {
            type: "text",
            text: `Error navigating to page: ${error.message}\n\nMake sure:\n1. Brave browser is installed at: ${this.bravePath}\n2. Or set BRAVE_BROWSER_PATH environment variable to the correct path\n3. Port ${this.cdpPort} is available (or set BRAVE_CDP_ENDPOINT to use a different port)`,
          },
        ],
        isError: true,
      };
    }
  }
}

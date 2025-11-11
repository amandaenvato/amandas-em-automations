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
    // General browser session storage (for fetch_page)
    this.browserDataDir = process.env.BROWSER_DATA_DIR || join(
      homedir(),
      ".local-mcp",
      "browser-data"
    );
    this.browserStorageStatePath = join(this.browserDataDir, "storage-state.json");
  }

  async cleanup(context, browser) {
    await Promise.allSettled([
      context?.close(),
      browser?.close(),
    ]);
  }

  /**
   * Setup browser, context, and page with shared storage state
   * @param {boolean} headless - Whether to run browser in headless mode
   * @returns {Promise<{browser: Browser, context: BrowserContext, page: Page}>}
   */
  async _setupBrowser(headless = false) {
      await mkdir(this.browserDataDir, { recursive: true });

    const browser = await chromium.launch({ headless });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        ...(existsSync(this.browserStorageStatePath) && { storageState: this.browserStorageStatePath }),
      });

    const page = await context.newPage();

    return { browser, context, page };
  }

  /**
   * Navigate to URL using commit strategy (faster, doesn't wait for full page load)
   * @param {Page} page - The Playwright page object
   * @param {string} url - The URL to navigate to
   */
  async _navigateToPage(page, url) {
      try {
        await page.goto(url, {
          waitUntil: "commit",
          timeout: 30000,
        });
      } catch (e) {
        // If navigation times out, continue anyway - we'll wait for indicators
      }
  }

  /**
   * Wait for indicators to appear on the page
   * @param {Page} page - The Playwright page object
   * @param {string[]} waitForIndicators - Array of text patterns or CSS selectors to wait for
   * @param {number} maxWaitTime - Maximum time to wait in milliseconds
   * @throws {Error} If timeout waiting for indicators
   */
  async _waitForIndicators(page, waitForIndicators, maxWaitTime) {
      const startTime = Date.now();
      let foundIndicators = [];

      while (Date.now() - startTime < maxWaitTime) {
        try {
          const pageText = await page.evaluate(
            () => {
              if (!document.body) return "";
              return document.body.innerText || document.body.textContent || "";
            }
          );
          const pageHTML = await page.content();

          // Check each indicator
          for (const indicator of waitForIndicators) {
            if (indicator.startsWith('css:')) {
              const selector = indicator.substring(4);
              try {
                const element = await page.$(selector);
                if (element) {
                  if (!foundIndicators.includes(indicator)) {
                    foundIndicators.push(indicator);
                  }
                }
              } catch (e) {
                // Element not found, continue
              }
            } else {
              try {
                const pattern = new RegExp(indicator, 'i');
                if (pattern.test(pageText) || pattern.test(pageHTML)) {
                  if (!foundIndicators.includes(indicator)) {
                    foundIndicators.push(indicator);
                  }
                }
              } catch (e) {
                // Invalid regex, skip
              }
            }
          }

          // If all indicators found, break
          if (foundIndicators.length === waitForIndicators.length) {
            break;
          }
        } catch (e) {
          // Page might be navigating, wait and retry
          if (e.message.includes('Execution context was destroyed') ||
              e.message.includes('Target closed') ||
              e.message.includes('Cannot read properties of null') ||
              e.message.includes('document.body')) {
            await setTimeout(1000);
            continue;
          }
          throw e;
        }

        await setTimeout(500);
      }

      if (foundIndicators.length < waitForIndicators.length) {
        const missing = waitForIndicators.filter(i => !foundIndicators.includes(i));
        throw new Error(
          `Timeout waiting for indicators. Found ${foundIndicators.length}/${waitForIndicators.length} indicators. ` +
          `Missing: ${missing.join(', ')}. ` +
          `Waited ${maxWaitTime / 1000}s.`
        );
      }
  }

  /**
   * Extract cookies from a page after waiting for indicators
   * @param {string} url - The URL to navigate to
   * @param {string[]} cookieNames - Array of cookie names to extract
   * @param {string[]} waitForIndicators - Array of text patterns or CSS selectors to wait for (required)
   * @param {number} maxWaitTime - Maximum time to wait in milliseconds (default: 120000)
   * @param {boolean} headless - Whether to run browser in headless mode (default: false)
   * @returns {Promise<{content: Array, isError?: boolean}>}
   */
  async extractCookies(url, cookieNames = [], waitForIndicators = [], maxWaitTime = 120000, headless = false) {
    let browser = null;
    let context = null;
    let page = null;

    try {
      if (!waitForIndicators || waitForIndicators.length === 0) {
        throw new Error("waitForIndicators is required. Provide at least one indicator to wait for (e.g., ['JW', 'Saved', 'css:.dashboard'])");
      }

      const setup = await this._setupBrowser(headless);
      browser = setup.browser;
      context = setup.context;
      page = setup.page;

      // Navigate to the page - use commit which is faster, don't wait for full page load
      await this._navigateToPage(page, url);

      // Wait for indicators (required) - this will handle waiting for page load and authentication
      await this._waitForIndicators(page, waitForIndicators, maxWaitTime);

      // Extract cookies
      const allCookies = await context.cookies();
      const extractedCookies = {};

      if (cookieNames && cookieNames.length > 0) {
        for (const cookieName of cookieNames) {
          const cookie = allCookies.find(c => c.name === cookieName);
          if (cookie) {
            extractedCookies[cookieName] = cookie.value;
          }
        }
      } else {
        // If no cookie names specified, return all cookies
        for (const cookie of allCookies) {
          extractedCookies[cookie.name] = cookie.value;
        }
      }

      // Save session state
      await context.storageState({ path: this.browserStorageStatePath });
      await this.cleanup(context, browser);

      return {
        content: [
          {
            type: "text",
            text: `# Extracted Cookies\n\n**URL**: ${url}\n\n## Cookies\n\n\`\`\`json\n${JSON.stringify(extractedCookies, null, 2)}\n\`\`\`\n\n## All Cookies (Full Details)\n\n\`\`\`json\n${JSON.stringify(allCookies, null, 2)}\n\`\`\``,
          },
        ],
      };
    } catch (error) {
      await this.cleanup(context, browser);
      return {
        content: [
          {
            type: "text",
            text: `Error extracting cookies: ${error.message}\n\n**URL**: ${url}\n\nIf this is an authenticated page, make sure you are logged in.`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Fetch a page and wait for indicators that it has loaded and logged in
   * @param {string} url - The URL to fetch
   * @param {string[]} waitForIndicators - Array of text patterns or CSS selectors to wait for (required)
   * @param {number} maxWaitTime - Maximum time to wait in milliseconds (default: 120000)
   * @param {boolean} headless - Whether to run browser in headless mode (default: false)
   * @returns {Promise<{content: Array, isError?: boolean}>}
   */
  async fetchPage(url, waitForIndicators = [], maxWaitTime = 120000, headless = false) {
    let browser = null;
    let context = null;
    let page = null;

    try {
      if (!waitForIndicators || waitForIndicators.length === 0) {
        throw new Error("waitForIndicators is required. Provide at least one indicator to wait for (e.g., ['Saved', 'In progress', 'css:.dashboard'])");
          }

      const setup = await this._setupBrowser(headless);
      browser = setup.browser;
      context = setup.context;
      page = setup.page;

      // Navigate to the page - use commit which is faster, don't wait for full page load
      await this._navigateToPage(page, url);

      // Wait for indicators (required) - this will handle waiting for page load and authentication
      await this._waitForIndicators(page, waitForIndicators, maxWaitTime);

      // Get page content with error handling
      let pageContent, pageText;
      try {
        pageContent = await page.content();
        pageText = await page.evaluate(
          () => {
            if (!document.body) return "";
            return document.body.innerText || document.body.textContent || "";
          }
        );
      } catch (e) {
        // If we can't get content, try one more time after a short wait
        await setTimeout(1000);
        pageContent = await page.content();
        pageText = await page.evaluate(
          () => {
            if (!document.body) return "";
            return document.body.innerText || document.body.textContent || "";
          }
        );
      }

      // Save session state so we don't have to log in every time
      await context.storageState({ path: this.browserStorageStatePath });
      await this.cleanup(context, browser);

      return {
        content: [
          {
            type: "text",
            text: `# Page Content\n\n**URL**: ${url}\n\n## HTML Content\n\n\`\`\`html\n${pageContent}\n\`\`\`\n\n## Text Content\n\n\`\`\`\n${pageText}\n\`\`\``,
          },
        ],
      };
    } catch (error) {
      await this.cleanup(context, browser);
      return {
        content: [
          {
            type: "text",
            text: `Error fetching page: ${error.message}\n\n**URL**: ${url}\n\nIf this is an authenticated page, make sure you are logged in.`,
          },
        ],
        isError: true,
      };
    }
  }

}

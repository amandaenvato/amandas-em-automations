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

      // Additional wait after indicators appear to ensure page is fully rendered
      await setTimeout(1500);

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

      // Additional wait after indicators appear to ensure page is fully rendered
      await setTimeout(1500);

      // Get page text content with error handling
      let pageText;
      try {
        pageText = await page.evaluate(
          () => {
            if (!document.body) return "";
            return document.body.innerText || document.body.textContent || "";
          }
        );
      } catch (e) {
        // If we can't get content, try one more time after a short wait
        await setTimeout(1000);
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
            text: `# Page Content\n\n**URL**: ${url}\n\n## Text Content\n\n\`\`\`\n${pageText}\n\`\`\``,
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

  /**
   * Add a topic to a Culture Amp conversation
   * @param {string} conversationUrl - The full URL to the Culture Amp conversation (e.g., 'https://envato.cultureamp.com/app/conversations/019a25d1-97d6-707b-8c0e-c46015a0b082?tab=conversation')
   * @param {string} topicTitle - The title of the topic to add
   * @param {string[]} waitForIndicators - Array of text patterns or CSS selectors to wait for (default: ['JW'])
   * @param {number} maxWaitTime - Maximum time to wait in milliseconds (default: 120000)
   * @param {boolean} headless - Whether to run browser in headless mode (default: false)
   * @returns {Promise<{content: Array, isError?: boolean}>}
   */
  async addCultureAmpTopic(conversationUrl, topicTitle, waitForIndicators = ['JW'], maxWaitTime = 120000, headless = false) {
    let browser = null;
    let context = null;
    let page = null;

    try {
      if (!topicTitle || topicTitle.trim() === '') {
        throw new Error("topicTitle is required and cannot be empty");
      }

      const setup = await this._setupBrowser(headless);
      browser = setup.browser;
      context = setup.context;
      page = setup.page;

      // Ensure URL has the conversation tab parameter
      const url = new URL(conversationUrl);
      url.searchParams.set('tab', 'conversation');
      const conversationUrlWithTab = url.toString();

      // Navigate to the conversation page
      await this._navigateToPage(page, conversationUrlWithTab);

      // Wait for indicators that the page has loaded
      await this._waitForIndicators(page, waitForIndicators, maxWaitTime);

      // Additional wait to ensure page is fully rendered
      await setTimeout(2000);

      // Try to find and click the "Add topic" button or similar
      // Common selectors for adding topics in Culture Amp
      const addTopicSelectors = [
        'button:has-text("Add topic")',
        'button:has-text("New topic")',
        'button:has-text("Add Topic")',
        '[data-testid="add-topic-button"]',
        '[aria-label*="Add topic" i]',
        '[aria-label*="New topic" i]',
        'button[aria-label*="topic" i]',
        '.add-topic-button',
        'button:has-text("+")',
        'a:has-text("Add topic")',
        'a:has-text("New topic")',
      ];

      let addButton = null;
      for (const selector of addTopicSelectors) {
        try {
          addButton = await page.$(selector);
          if (addButton) {
            break;
          }
        } catch (e) {
          // Selector not found, try next
          continue;
        }
      }

      // If no button found, try to find by text content
      if (!addButton) {
        const buttons = await page.$$('button, a');
        for (const button of buttons) {
          const text = await button.textContent();
          if (text && /add.*topic|new.*topic/i.test(text)) {
            addButton = button;
            break;
          }
        }
      }

      if (!addButton) {
        // Take a screenshot for debugging
        const pageText = await page.evaluate(() => document.body.innerText || '');
        
        throw new Error(
          `Could not find "Add topic" button on the page. ` +
          `Please check the page structure. ` +
          `Page contains: ${pageText.substring(0, 500)}...`
        );
      }

      // Click the add topic button
      await addButton.click();
      await setTimeout(1000); // Wait for form/modal to appear

      // Find the input field for the topic title
      const inputSelectors = [
        'input[type="text"]',
        'input[placeholder*="topic" i]',
        'input[placeholder*="title" i]',
        'textarea',
        '[contenteditable="true"]',
        '[data-testid="topic-title-input"]',
        'input[name*="title" i]',
        'input[name*="topic" i]',
      ];

      let topicInput = null;
      for (const selector of inputSelectors) {
        try {
          const inputs = await page.$$(selector);
          // Prefer inputs that are visible and in focus
          for (const input of inputs) {
            const isVisible = await input.isVisible();
            if (isVisible) {
              topicInput = input;
              break;
            }
          }
          if (topicInput) break;
        } catch (e) {
          continue;
        }
      }

      // If no input found, try to find the focused element
      if (!topicInput) {
        try {
          const focused = await page.evaluateHandle(() => document.activeElement);
          if (focused) {
            const tagName = await focused.evaluate(el => el.tagName);
            if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
              topicInput = focused;
            }
          }
        } catch (e) {
          // Ignore
        }
      }

      if (!topicInput) {
        throw new Error(
          `Could not find input field for topic title. ` +
          `The form may have appeared but the input field structure is different.`
        );
      }

      // Clear and type the topic title
      await topicInput.click();
      await setTimeout(500);
      
      // Clear existing content if any
      await topicInput.fill('');
      await setTimeout(300);
      
      // Type the topic title
      await topicInput.type(topicTitle, { delay: 50 });
      await setTimeout(1000);

      // Find and click the submit/save button
      const submitSelectors = [
        'button:has-text("Save")',
        'button:has-text("Add")',
        'button:has-text("Create")',
        'button[type="submit"]',
        '[data-testid="save-topic-button"]',
        '[data-testid="submit-topic-button"]',
        'button[aria-label*="save" i]',
        'button[aria-label*="add" i]',
        'button[aria-label*="create" i]',
      ];

      let submitButton = null;
      for (const selector of submitSelectors) {
        try {
          submitButton = await page.$(selector);
          if (submitButton && await submitButton.isVisible()) {
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // If no submit button found, try Enter key
      if (!submitButton) {
        await page.keyboard.press('Enter');
        await setTimeout(2000);
      } else {
        await submitButton.click();
        await setTimeout(2000);
      }

      // Wait a bit for the topic to be saved
      await setTimeout(2000);

      // Verify the topic was added by checking if it appears on the page
      const pageTextAfter = await page.evaluate(() => document.body.innerText || '');
      const topicAdded = pageTextAfter.includes(topicTitle);

      // Save session state
      await context.storageState({ path: this.browserStorageStatePath });
      await this.cleanup(context, browser);

      if (topicAdded) {
        return {
          content: [
            {
              type: "text",
              text: `# Topic Added Successfully\n\n**Topic Title**: ${topicTitle}\n\n**Conversation URL**: ${conversationUrlWithTab}\n\nThe topic "${topicTitle}" has been added to the Culture Amp conversation.`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `# Topic Addition Completed\n\n**Topic Title**: ${topicTitle}\n\n**Conversation URL**: ${conversationUrlWithTab}\n\nThe topic form was submitted, but verification that it was saved could not be confirmed. Please check the conversation page to verify the topic was added.`,
            },
          ],
        };
      }
    } catch (error) {
      await this.cleanup(context, browser);
      return {
        content: [
          {
            type: "text",
            text: `Error adding topic to Culture Amp: ${error.message}\n\n**Conversation URL**: ${conversationUrl}\n\n**Topic Title**: ${topicTitle}\n\nIf this is an authenticated page, make sure you are logged in.`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Add a private note to a Culture Amp conversation
   * @param {string} conversationUrl - The full URL to the Culture Amp conversation (e.g., 'https://envato.cultureamp.com/app/conversations/019a25d1-97d6-707b-8c0e-c46015a0b082')
   * @param {string} noteText - The text of the private note to add
   * @param {string[]} waitForIndicators - Array of text patterns or CSS selectors to wait for (default: ['JW'])
   * @param {number} maxWaitTime - Maximum time to wait in milliseconds (default: 120000)
   * @param {boolean} headless - Whether to run browser in headless mode (default: false)
   * @returns {Promise<{content: Array, isError?: boolean}>}
   */
  async addCultureAmpPrivateNote(conversationUrl, noteText, waitForIndicators = ['JW'], maxWaitTime = 120000, headless = false) {
    let browser = null;
    let context = null;
    let page = null;

    try {
      if (!noteText || noteText.trim() === '') {
        throw new Error("noteText is required and cannot be empty");
      }

      const setup = await this._setupBrowser(headless);
      browser = setup.browser;
      context = setup.context;
      page = setup.page;

      // Ensure URL has the personal_note tab parameter
      const url = new URL(conversationUrl);
      url.searchParams.set('tab', 'personal_note');
      const conversationUrlWithTab = url.toString();

      // Navigate to the conversation page
      await this._navigateToPage(page, conversationUrlWithTab);

      // Wait for indicators that the page has loaded
      await this._waitForIndicators(page, waitForIndicators, maxWaitTime);

      // Additional wait to ensure page is fully rendered
      await setTimeout(2000);

      // Find the personal notes editor - could be a textarea, contenteditable div, or similar
      const editorSelectors = [
        'textarea[placeholder*="note" i]',
        'textarea[placeholder*="personal" i]',
        '[contenteditable="true"]',
        '[contenteditable=""]',
        'textarea',
        '[data-testid="personal-note-editor"]',
        '[data-testid="note-editor"]',
        '.personal-note-editor',
        '.note-editor',
        '[role="textbox"]',
      ];

      let noteEditor = null;
      for (const selector of editorSelectors) {
        try {
          const editors = await page.$$(selector);
          // Prefer visible editors
          for (const editor of editors) {
            const isVisible = await editor.isVisible();
            if (isVisible) {
              noteEditor = editor;
              break;
            }
          }
          if (noteEditor) break;
        } catch (e) {
          continue;
        }
      }

      // If no editor found, try to find by text content
      if (!noteEditor) {
        const allTextareas = await page.$$('textarea');
        for (const textarea of allTextareas) {
          const isVisible = await textarea.isVisible();
          if (isVisible) {
            noteEditor = textarea;
            break;
          }
        }
      }

      // Try contenteditable divs
      if (!noteEditor) {
        const contentEditables = await page.$$('[contenteditable="true"], [contenteditable=""]');
        for (const editable of contentEditables) {
          const isVisible = await editable.isVisible();
          if (isVisible) {
            noteEditor = editable;
            break;
          }
        }
      }

      if (!noteEditor) {
        const pageText = await page.evaluate(() => document.body.innerText || '');
        throw new Error(
          `Could not find personal notes editor on the page. ` +
          `Please check the page structure. ` +
          `Page contains: ${pageText.substring(0, 500)}...`
        );
      }

      // Click the editor to focus it
      await noteEditor.click();
      await setTimeout(500);

      // Clear existing content if any
      try {
        await noteEditor.fill('');
      } catch (e) {
        // If fill doesn't work, try clearing contenteditable
        try {
          await noteEditor.evaluate(el => {
            el.textContent = '';
            el.innerHTML = '';
          });
        } catch (e2) {
          // Try selecting all and deleting
          await page.keyboard.press('Meta+A');
          await page.keyboard.press('Delete');
        }
      }
      await setTimeout(300);

      // Type the note text
      // For contenteditable, we might need to use evaluate
      const tagName = await noteEditor.evaluate(el => el.tagName);
      if (tagName === 'TEXTAREA' || tagName === 'INPUT') {
        await noteEditor.type(noteText, { delay: 50 });
      } else {
        // For contenteditable divs, use evaluate to set text
        await noteEditor.evaluate((el, text) => {
          el.textContent = text;
          el.innerText = text;
          // Trigger input event
          const event = new Event('input', { bubbles: true });
          el.dispatchEvent(event);
        }, noteText);
      }
      await setTimeout(1000);

      // Look for a save button or auto-save indicator
      // Personal notes in Culture Amp often auto-save, but let's look for save buttons
      const saveSelectors = [
        'button:has-text("Save")',
        'button:has-text("Save note")',
        'button[type="submit"]',
        '[data-testid="save-note-button"]',
        'button[aria-label*="save" i]',
      ];

      let saveButton = null;
      for (const selector of saveSelectors) {
        try {
          saveButton = await page.$(selector);
          if (saveButton && await saveButton.isVisible()) {
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // If save button found, click it
      if (saveButton) {
        await saveButton.click();
        await setTimeout(2000);
      } else {
        // If no save button, wait a bit for auto-save
        await setTimeout(3000);
      }

      // Verify the note was added by checking if it appears in the editor
      const editorContent = await noteEditor.evaluate(el => {
        return el.textContent || el.innerText || el.value || '';
      });
      const noteAdded = editorContent.includes(noteText.substring(0, 50));

      // Save session state
      await context.storageState({ path: this.browserStorageStatePath });
      await this.cleanup(context, browser);

      if (noteAdded) {
        return {
          content: [
            {
              type: "text",
              text: `# Private Note Added Successfully\n\n**Note Text**: ${noteText}\n\n**Conversation URL**: ${conversationUrlWithTab}\n\nThe private note has been added to the Culture Amp conversation Personal notes tab.`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `# Private Note Addition Completed\n\n**Note Text**: ${noteText}\n\n**Conversation URL**: ${conversationUrlWithTab}\n\nThe note text was entered, but verification that it was saved could not be confirmed. Please check the Personal notes tab to verify the note was added.`,
            },
          ],
        };
      }
    } catch (error) {
      await this.cleanup(context, browser);
      return {
        content: [
          {
            type: "text",
            text: `Error adding private note to Culture Amp: ${error.message}\n\n**Conversation URL**: ${conversationUrl}\n\n**Note Text**: ${noteText}\n\nIf this is an authenticated page, make sure you are logged in.`,
          },
        ],
        isError: true,
      };
    }
  }

}

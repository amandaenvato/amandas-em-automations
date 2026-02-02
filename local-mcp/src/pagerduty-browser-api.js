import { chromium } from "playwright";
import { setTimeout } from "timers/promises";
import { homedir } from "os";
import { join } from "path";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";

/**
 * PagerDuty API client that uses browser automation to make authenticated API calls
 * This bypasses the need for OAuth tokens by using browser cookies directly
 */
export class PagerDutyBrowserAPI {
  constructor() {
    this.browserDataDir = process.env.BROWSER_DATA_DIR || join(
      homedir(),
      ".local-mcp",
      "browser-data"
    );
    this.browserStorageStatePath = join(this.browserDataDir, "storage-state.json");
  }

  /**
   * Make an authenticated API call to PagerDuty using browser context
   * Uses browser's fetch API from within page context to include cookies automatically
   * @param {string} endpoint - API endpoint (e.g., '/users')
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} API response data
   */
  async fetchApi(endpoint, options = {}) {
    let browser = null;
    let context = null;
    let page = null;

    try {
      await mkdir(this.browserDataDir, { recursive: true });

      const browserInstance = await chromium.launch({ headless: false }); // Show browser so user can see it
      browser = browserInstance;
      
      const browserContext = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        ...(existsSync(this.browserStorageStatePath) && { 
          storageState: this.browserStorageStatePath 
        }),
      });
      context = browserContext;
      page = await context.newPage();

      // Navigate to PagerDuty first to ensure we're authenticated
      // This will use existing session if available
      console.log('🔐 Checking authentication...');
      
      try {
        await page.goto('https://envato.pagerduty.com', { 
          waitUntil: 'networkidle',
          timeout: 60000 
        });
      } catch (e) {
        // Navigation might have timed out, but page might still be usable
        console.log('⚠️  Navigation timeout, continuing...');
      }

      // Wait for page to stabilize
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await setTimeout(2000);

      // Check if we're logged in by looking for common PagerDuty elements
      let isLoggedIn = false;
      try {
        isLoggedIn = await page.evaluate(() => {
          // Check for common logged-in indicators
          const bodyText = document.body.innerText || '';
          return bodyText.includes('Incidents') || 
                 bodyText.includes('Schedules') ||
                 bodyText.includes('On-Call') ||
                 bodyText.includes('Dashboard') ||
                 window.location.href.includes('pagerduty.com');
        });
      } catch (e) {
        // Page might have navigated, try again
        await setTimeout(2000);
        try {
          isLoggedIn = await page.evaluate(() => {
            const bodyText = document.body.innerText || '';
            return bodyText.includes('Incidents') || 
                   bodyText.includes('Schedules') ||
                   bodyText.includes('On-Call');
          });
        } catch (e2) {
          // Still having issues, assume not logged in
          isLoggedIn = false;
        }
      }

      if (!isLoggedIn) {
        console.log('⚠️  Not logged in. Please log in to PagerDuty in the browser window...');
        console.log('Waiting for you to log in (up to 5 minutes)...');
        
        // Wait for user to log in (check every 3 seconds for up to 5 minutes)
        const startTime = Date.now();
        const maxWait = 300000; // 5 minutes
        
        while (Date.now() - startTime < maxWait) {
          await setTimeout(3000);
          
          try {
            // Wait for any navigation to complete
            await page.waitForLoadState('networkidle', { timeout: 2000 }).catch(() => {});
            
            const loggedIn = await page.evaluate(() => {
              const bodyText = document.body.innerText || '';
              return bodyText.includes('Incidents') || 
                     bodyText.includes('Schedules') ||
                     bodyText.includes('On-Call') ||
                     bodyText.includes('Dashboard');
            });
            
            if (loggedIn) {
              console.log('✅ Logged in!');
              await setTimeout(2000); // Give it a moment to fully load
              break;
            }
          } catch (e) {
            // Page might be navigating, continue waiting
            continue;
          }
        }
      } else {
        console.log('✅ Already logged in!');
      }

      // Make API call using browser context's request API (handles cookies automatically)
      // This bypasses CORS issues by using Playwright's request API
      const apiUrl = `https://api.pagerduty.com${endpoint}`;
      console.log(`📡 Making API call: ${apiUrl}`);
      
      // Get cookies from the current page context
      const cookies = await context.cookies();
      const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      
      // Use context.request which handles cookies from the browser context
      const response = await context.request.get(apiUrl, {
        headers: {
          'Accept': 'application/vnd.pagerduty+json;version=2',
          'Content-Type': 'application/json',
          'Cookie': cookieString, // Explicitly include cookies
          ...options.headers,
        },
      });

      // Read response before closing browser
      const text = await response.text();
      const status = response.status();
      const statusText = response.statusText();
      
      // Save session state so we don't have to log in again
      await context.storageState({ path: this.browserStorageStatePath });
      await browser.close();

      if (status < 200 || status >= 300) {
        let errorMsg = statusText;
        try {
          const errorData = JSON.parse(text);
          errorMsg = errorData.error?.message || errorData.message || statusText;
        } catch (e) {
          // Not JSON, use statusText
        }
        throw new Error(`PagerDuty API error (${status}): ${errorMsg}`);
      }

      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error(
          `PagerDuty API error: ${status} ${statusText}. Response: ${text.substring(0, 500)}`
        );
      }

      return data;
    } catch (error) {
      if (browser) await browser.close();
      throw error;
    }
  }

  /**
   * List users
   */
  async listUsers(options = {}) {
    const params = new URLSearchParams();
    if (options.query) params.append("query", options.query);
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.offset) params.append("offset", options.offset.toString());

    const queryString = params.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ""}`;
    return await this.fetchApi(endpoint);
  }

  /**
   * Get on-call entries for a user
   */
  async getUserOnCalls(userId, options = {}) {
    const params = new URLSearchParams();
    if (options.since) params.append("since", options.since);
    if (options.until) params.append("until", options.until);
    if (options.schedule_ids && Array.isArray(options.schedule_ids)) {
      options.schedule_ids.forEach(id => params.append("schedule_ids[]", id));
    }

    const queryString = params.toString();
    const endpoint = `/users/${userId}/on_calls${queryString ? `?${queryString}` : ""}`;
    return await this.fetchApi(endpoint);
  }

  /**
   * Calculate total on-call hours for a user
   */
  async calculateOnCallHours(userId, startDate, endDate, scheduleIds = null) {
    const start = startDate instanceof Date ? startDate.toISOString() : startDate;
    const end = endDate instanceof Date ? endDate.toISOString() : endDate;

    const options = {
      since: start,
      until: end,
    };
    if (scheduleIds) {
      options.schedule_ids = scheduleIds;
    }

    const data = await this.getUserOnCalls(userId, options);

    let totalHours = 0;

    if (data.on_calls && Array.isArray(data.on_calls)) {
      const startTime = new Date(start);
      const endTime = new Date(end);

      for (const onCall of data.on_calls) {
        const onCallStart = new Date(onCall.start);
        const onCallEnd = new Date(onCall.end);

        const intersectionStart = onCallStart > startTime ? onCallStart : startTime;
        const intersectionEnd = onCallEnd < endTime ? onCallEnd : endTime;

        if (intersectionStart < intersectionEnd) {
          const hours = (intersectionEnd - intersectionStart) / (1000 * 60 * 60);
          totalHours += hours;
        }
      }
    }

    return totalHours;
  }
}


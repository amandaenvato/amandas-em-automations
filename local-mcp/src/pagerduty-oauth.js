import { chromium } from "playwright";
import { setTimeout } from "timers/promises";
import { homedir } from "os";
import { join } from "path";
import { mkdir } from "fs/promises";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { randomBytes } from "crypto";

/**
 * Helper class for PagerDuty OAuth authentication
 */
export class PagerDutyOAuth {
  constructor() {
    this.clientId = process.env.PAGERDUTY_CLIENT_ID;
    this.clientSecret = process.env.PAGERDUTY_CLIENT_SECRET;
    this.tokenUrl = process.env.PAGERDUTY_OAUTH_TOKEN_URL || "https://identity.pagerduty.com/oauth/token";
    this.authUrl = process.env.PAGERDUTY_OAUTH_AUTH_URL || "https://identity.pagerduty.com/oauth/authorize";
    this.scopes = process.env.PAGERDUTY_OAUTH_SCOPES || "read write";
    this.redirectUri = process.env.PAGERDUTY_OAUTH_REDIRECT_URI || "http://localhost:3000/callback";
    
    // Store tokens in a file
    this.tokenFilePath = join(
      homedir(),
      ".local-mcp",
      "pagerduty-oauth-token.json"
    );
  }

  /**
   * Get OAuth access token, either from cache or by completing OAuth flow
   * @param {boolean} forceRefresh - Force refresh even if token exists
   * @param {boolean} headless - Run browser in headless mode
   * @returns {Promise<string>} Access token
   */
  async getAccessToken(forceRefresh = false, headless = false) {
    // Check for cached token
    if (!forceRefresh && existsSync(this.tokenFilePath)) {
      try {
        const tokenData = JSON.parse(readFileSync(this.tokenFilePath, 'utf8'));
        // Check if token is still valid (with 5 minute buffer)
        if (tokenData.expires_at && tokenData.expires_at > Date.now() + 5 * 60 * 1000) {
          return tokenData.access_token;
        }
      } catch (e) {
        // Token file corrupted, continue to get new token
      }
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        "PAGERDUTY_CLIENT_ID and PAGERDUTY_CLIENT_SECRET must be set in environment variables"
      );
    }

    // Generate state for CSRF protection
    const state = randomBytes(32).toString('hex');
    
    // Build authorization URL
    const authParams = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: this.scopes,
      state: state,
    });
    const authorizationUrl = `${this.authUrl}?${authParams.toString()}`;

    // Start a local server to catch the callback
    const callbackPromise = this.startCallbackServer(state);
    const callbackServer = await callbackPromise;
    
    let browser = null;
    let context = null;
    let page = null;
    let authCode = null;
    let returnedState = null;

    try {
      // Launch browser
      browser = await chromium.launch({ headless });
      context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
      });
      page = await context.newPage();

      console.log('Opening PagerDuty authorization page...');
      await page.goto(authorizationUrl, { waitUntil: 'networkidle' });

      // Wait for user to authorize (check for redirect to callback URL)
      console.log('Please authorize the application in the browser...');
      console.log('Waiting for authorization...');
      
      // Wait for navigation to callback URL with timeout
      try {
        await page.waitForURL(url => url.href.startsWith(this.redirectUri), { 
          timeout: 300000 // 5 minutes
        });
        
        // Get the authorization code from the URL
        const currentUrl = page.url();
        const urlObj = new URL(currentUrl);
        authCode = urlObj.searchParams.get('code');
        returnedState = urlObj.searchParams.get('state');
      } catch (error) {
        // Check current URL in case we're already there
        const currentUrl = page.url();
        if (currentUrl.includes('code=') || currentUrl.startsWith(this.redirectUri)) {
          const urlObj = new URL(currentUrl);
          authCode = urlObj.searchParams.get('code');
          returnedState = urlObj.searchParams.get('state');
        } else {
          throw new Error(`OAuth timeout: Did not receive callback. Current URL: ${currentUrl}`);
        }
      }

      if (!authCode) {
        const error = page.url().includes('error') ? new URL(page.url()).searchParams.get('error') : null;
        throw new Error(`OAuth authorization failed: ${error || 'No authorization code received (timeout)'}`);
      }

      if (returnedState !== state) {
        throw new Error('OAuth state mismatch - possible CSRF attack');
      }

      // Exchange authorization code for access token
      const tokenResponse = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: authCode,
          redirect_uri: this.redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Failed to exchange authorization code: ${tokenResponse.status} ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      
      // Calculate expiration time
      const expiresAt = Date.now() + (tokenData.expires_in * 1000);
      const tokenToStore = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        token_type: tokenData.token_type || 'Bearer',
      };

      // Save token to file
      await mkdir(join(homedir(), ".local-mcp"), { recursive: true });
      writeFileSync(this.tokenFilePath, JSON.stringify(tokenToStore, null, 2));

      await browser.close();
      if (callbackServer && callbackServer.close) {
        await callbackServer.close();
      }

      return tokenData.access_token;
    } catch (error) {
      if (browser) await browser.close();
      if (callbackServer && callbackServer.close) {
        await callbackServer.close();
      }
      throw error;
    }
  }

  /**
   * Start a local HTTP server to catch the OAuth callback
   * @private
   */
  async startCallbackServer(expectedState) {
    // For now, we'll rely on browser navigation detection
    // The callback server is optional since we can detect the redirect in the browser
    return {
      close: async () => {
        // No-op for now
      }
    };
  }

  /**
   * Refresh access token using refresh token
   * @returns {Promise<string>} New access token
   */
  async refreshAccessToken() {
    if (!existsSync(this.tokenFilePath)) {
      throw new Error('No refresh token available. Please complete OAuth flow first.');
    }

    const tokenData = JSON.parse(readFileSync(this.tokenFilePath, 'utf8'));
    if (!tokenData.refresh_token) {
      throw new Error('No refresh token available. Please complete OAuth flow again.');
    }

    const tokenResponse = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: tokenData.refresh_token,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to refresh token: ${tokenResponse.status} ${errorText}`);
    }

    const newTokenData = await tokenResponse.json();
    const expiresAt = Date.now() + (newTokenData.expires_in * 1000);
    const tokenToStore = {
      access_token: newTokenData.access_token,
      refresh_token: newTokenData.refresh_token || tokenData.refresh_token,
      expires_at: expiresAt,
      token_type: newTokenData.token_type || 'Bearer',
    };

    writeFileSync(this.tokenFilePath, JSON.stringify(tokenToStore, null, 2));
    return newTokenData.access_token;
  }
}


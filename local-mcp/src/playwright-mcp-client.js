import { spawn } from "child_process";

export class PlaywrightMCPClient {
  constructor() {
    this.process = null;
  }

  async callTool(toolName, args) {
    try {
      const request = {
        jsonrpc: "2.0",
        id: Math.floor(Math.random() * 10000),
        method: "tools/call",
        params: {
          name: toolName,
          arguments: args
        }
      };

      // Spawn the Playwright MCP server if not already running
      if (!this.process) {
        console.error('Spawning Playwright MCP server...');

        this.process = spawn("npx", [
          "@playwright/mcp@latest",
          "--extension",
          "--executable-path",
          "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
        ], {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: {
            ...process.env,
            PLAYWRIGHT_MCP_EXTENSION_TOKEN: "-fF9pRdsXwJfw4rKv6PnblyaCmYtibs9UdqD4l_BARw"
          }
        });

        // Handle process events
        this.process.on('exit', (code) => {
          console.error('Playwright MCP process exited with code:', code);
          this.process = null;
        });

        this.process.on('error', (error) => {
          console.error('Playwright MCP process error:', error);
        });

        // Wait for the server to initialize by sending a ping
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout waiting for Playwright MCP server to start'));
          }, 5000);

          let hasResolved = false;

          const onData = (data) => {
            console.error('Server startup data:', data.toString());
            if (!hasResolved) {
              hasResolved = true;
              clearTimeout(timeout);
              this.process.stdout.removeListener('data', onData);
              resolve();
            }
          };

          this.process.stdout.on('data', onData);

          // Send a ping to wake up the server
          setTimeout(() => {
            if (this.process.stdin) {
              this.process.stdin.write(JSON.stringify({
                jsonrpc: "2.0",
                id: 0,
                method: "ping"
              }) + '\n');
            }
          }, 1000);
        });
      }

      return new Promise((resolve, reject) => {
        if (!this.process || !this.process.stdout || !this.process.stdin) {
          reject(new Error('Playwright MCP process is not properly initialized'));
          return;
        }

        let output = '';

        const onData = (data) => {
          output += data.toString();
          console.error('Received data from Playwright MCP:', data.toString());

          // Try to parse complete JSON lines
          const lines = output.split('\n');
          for (const line of lines) {
            if (line.trim()) {
              try {
                const response = JSON.parse(line);
                console.error('Parsed response:', response);
                if (response.id === request.id) {
                  cleanup();
                  resolve(response);
                  return;
                }
              } catch (e) {
                // Not JSON yet, continue
              }
            }
          }
        };

        const onError = (error) => {
          console.error('Error from Playwright MCP process:', error);
          cleanup();
          reject(error);
        };

        const cleanup = () => {
          if (this.process && this.process.stdout) {
            this.process.stdout.removeListener('data', onData);
          }
          if (this.process && this.process.stderr) {
            this.process.stderr.removeListener('error', onError);
          }
        };

        this.process.stdout.on('data', onData);
        if (this.process.stderr) {
          this.process.stderr.on('error', onError);
        }

        // Set timeout
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('Timeout waiting for Playwright MCP response'));
        }, 15000);

        // Send the request
        const requestStr = JSON.stringify(request) + '\n';
        console.error('Sending request to Playwright MCP:', requestStr);
        this.process.stdin.write(requestStr, (err) => {
          if (err) {
            cleanup();
            clearTimeout(timeout);
            reject(err);
          }
        });

        // Clean up timeout on success
        const originalResolve = resolve;
        resolve = (value) => {
          clearTimeout(timeout);
          originalResolve(value);
        };
      });
    } catch (error) {
      throw new Error(`Failed to call Playwright MCP tool: ${error.message}`);
    }
  }
}


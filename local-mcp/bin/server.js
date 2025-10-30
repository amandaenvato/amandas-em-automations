#!/usr/bin/env node

// This is the executable script that will be called by npx
// It simply runs the main server file

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Run the main server
const serverPath = join(__dirname, "index.js");
const child = spawn("node", [serverPath], {
  stdio: "inherit",
  cwd: __dirname
});

child.on("error", (error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code);
});

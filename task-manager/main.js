const { ipcMain, app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { menubar } = require('menubar');

// Handle icon path - use default if custom icon doesn't exist
let iconPath = path.join(__dirname, 'icon.png');
if (!fs.existsSync(iconPath)) {
  iconPath = undefined;
}

// Initialize menubar - let it handle window positioning relative to tray icon
const mb = menubar({
  index: `file://${path.join(__dirname, 'index.html')}`,
  icon: iconPath,
  tooltip: 'EM Helper',
  width: 320,
  height: 500,
  preloadWindow: true,
  showDockIcon: false,
  browserWindow: {
    width: 320,
    height: 500,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    frame: false,
    transparent: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    useContentSize: true
  }
});

// Function to update autorun setting
function setAutoLaunch(enabled) {
  const settings = {
    openAtLogin: enabled,
    openAsHidden: false,
    name: 'Task Manager',
    path: process.execPath,
    args: [path.join(__dirname)]
  };

  console.log('Setting auto-launch:', enabled, settings);
  app.setLoginItemSettings(settings);

  // Verify it was set correctly
  const currentSettings = app.getLoginItemSettings();
  console.log('Auto-launch settings after update:', currentSettings);
}

// Function to get current autorun state
function getAutoLaunch() {
  const settings = app.getLoginItemSettings();
  console.log('Getting auto-launch state:', settings.openAtLogin);
  return settings.openAtLogin;
}

mb.on('ready', () => {
  console.log('Task Manager is ready');
});

// Track window state to prevent race conditions
let blurTimeout = null;
let lastShowTime = 0;
const SHOW_COOLDOWN = 300; // ms to wait after show before allowing blur to hide

mb.on('after-create-window', () => {
  console.log('Window created');

  // Let menubar handle window positioning - don't override it

  // Close window when it loses focus
  mb.window.on('blur', () => {
    const timeSinceShow = Date.now() - lastShowTime;
    console.log('Window lost focus, time since show:', timeSinceShow);

    // Clear any pending timeout
    if (blurTimeout) {
      clearTimeout(blurTimeout);
      blurTimeout = null;
    }

    // Don't hide if we just showed the window (within cooldown period)
    if (timeSinceShow < SHOW_COOLDOWN) {
      console.log('Skipping hide - window was just shown');
      return;
    }

    // Add a delay to prevent hiding if the window is being shown again
    blurTimeout = setTimeout(() => {
      const timeSinceShowNow = Date.now() - lastShowTime;
      // Only hide if enough time has passed and window is still not focused
      if (timeSinceShowNow >= SHOW_COOLDOWN && mb.window && !mb.window.isDestroyed() && !mb.window.isFocused()) {
        console.log('Hiding window after blur');
      mb.window.hide();
      }
      blurTimeout = null;
    }, 200);
  });

  // Cancel blur timeout if window gains focus
  mb.window.on('focus', () => {
    console.log('Window gained focus');
    if (blurTimeout) {
      clearTimeout(blurTimeout);
      blurTimeout = null;
    }
  });
});

mb.on('show', () => {
  console.log('Window show event triggered');
  lastShowTime = Date.now();

  // Cancel any pending blur timeout
  if (blurTimeout) {
    clearTimeout(blurTimeout);
    blurTimeout = null;
  }

  // Let menubar handle window showing - don't override
  if (mb.window && !mb.window.isDestroyed()) {
    mb.window.focus();
  }
});

mb.on('hide', () => {
  console.log('Window hidden');
});

mb.on('after-show', () => {
  console.log('Window after-show');
  if (mb.window) {
    mb.window.focus();
  }
});

// Handle window close request from renderer
ipcMain.on('close-window', () => {
  if (mb.window) {
    mb.window.hide();
  }
});

// IPC handlers for autorun management
ipcMain.handle('get-auto-launch', () => {
  return getAutoLaunch();
});

ipcMain.handle('set-auto-launch', (event, enabled) => {
  setAutoLaunch(enabled);
  return getAutoLaunch();
});

// IPC handler for quit
ipcMain.on('quit-app', () => {
  app.quit();
});

// Track output windows
const outputWindows = new Map();

// Function to create output window
function createOutputWindow(recipePath, recipeDisplayName) {
  const outputWindow = new BrowserWindow({
    width: 900,
    height: 700,
    title: `Recipe Output: ${recipeDisplayName}`,
    backgroundColor: '#1e1e1e',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: true
  });

  outputWindow.loadFile(path.join(__dirname, 'output-window.html'));

  // Send initial status
  outputWindow.webContents.once('did-finish-load', () => {
    outputWindow.webContents.send('output-status', {
      text: 'Running...',
      type: 'running',
      recipeName: recipeDisplayName
    });
  });

  // Clean up when window is closed
  outputWindow.on('closed', () => {
    outputWindows.delete(recipePath);
  });

  outputWindows.set(recipePath, outputWindow);
  return outputWindow;
}

// IPC handler for running cursor-agent
ipcMain.handle('run-recipe', async (event, recipePath) => {
  return new Promise((resolve, reject) => {
    // Get the workspace root (parent directory of task-manager)
    const workspaceRoot = path.join(__dirname, '..');
    const fullRecipePath = path.join(workspaceRoot, recipePath);

    // Extract recipe display name
    const recipeName = path.basename(recipePath, '.md');
    const recipeDisplayName = recipeName.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    // Build the command
    const prompt = `Read the ${recipePath} recipe and complete the steps it describes`;
    const command = 'cursor-agent';
    // When using shell: true, we can pass the full command as a string
    // This properly handles spaces and special characters in the prompt
    const fullCommand = `${command} agent "${prompt}" -p -f --output-format stream-json`;

    console.log('Running recipe:', fullRecipePath);
    console.log('Command:', fullCommand);

    // Create output window
    const outputWindow = createOutputWindow(recipePath, recipeDisplayName);

    // Spawn the cursor-agent process
    // Use shell: true to properly handle quoted arguments and ensure cursor-agent is found in PATH
    const child = spawn(fullCommand, {
      cwd: workspaceRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });

    let stdout = '';
    let stderr = '';

    // Stream stdout to output window
    child.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      console.log('stdout:', text);

      // Send data to output window as plain text
      if (!outputWindow.isDestroyed()) {
        outputWindow.webContents.send('output-data', text);
      }
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      console.error('stderr:', text);

      // Send stderr to output window as error
      if (!outputWindow.isDestroyed()) {
        outputWindow.webContents.send('output-error', text);
      }
    });

    child.on('error', (error) => {
      console.error('Failed to start cursor-agent:', error);

      if (!outputWindow.isDestroyed()) {
        outputWindow.webContents.send('output-error', error.message);
        outputWindow.webContents.send('output-status', {
          text: 'Error',
          type: 'error'
        });
      }

      reject({
        success: false,
        error: error.message,
        code: 'SPAWN_ERROR'
      });
    });

    child.on('close', (code) => {
      if (code === 0) {
        if (!outputWindow.isDestroyed()) {
          outputWindow.webContents.send('output-complete', {
            success: true,
            stdout,
            stderr
          });
        }
        resolve({
          success: true,
          stdout,
          stderr
        });
      } else {
        if (!outputWindow.isDestroyed()) {
          outputWindow.webContents.send('output-complete', {
            success: false,
            error: stderr || `Process exited with code ${code}`,
            stdout,
            stderr
          });
        }
        reject({
          success: false,
          error: stderr || `Process exited with code ${code}`,
          code,
          stdout,
          stderr
        });
      }
    });
  });
});

// IPC handler for scanning recipes directory
ipcMain.handle('scan-recipes', async () => {
  try {
    const recipesDir = path.join(__dirname, '..', 'recipes');
    const recipes = [];

    function scanDirectory(dir, relativePath = '') {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(relativePath, entry.name);

        if (entry.isDirectory()) {
          // Skip dated directories (e.g., "12-11-2025")
          if (!/^\d{2}-\d{2}-\d{4}$/.test(entry.name)) {
            scanDirectory(fullPath, relPath);
          }
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          // Skip OUTPUT.md files
          if (entry.name !== 'OUTPUT.md' && entry.name !== 'current-doc.md') {
            const recipeName = entry.name.replace('.md', '');
            recipes.push({
              name: recipeName,
              path: `recipes/${relPath}`,
              displayName: recipeName.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')
            });
          }
        }
      }
    }

    scanDirectory(recipesDir);

    // Sort recipes by path for consistent ordering
    recipes.sort((a, b) => a.path.localeCompare(b.path));

    return recipes;
  } catch (error) {
    console.error('Error scanning recipes:', error);
    return [];
  }
});

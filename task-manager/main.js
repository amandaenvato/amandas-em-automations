const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { menubar } = require('menubar');

// Handle icon path - use default if custom icon doesn't exist
let iconPath = path.join(__dirname, 'icon.png');
if (!fs.existsSync(iconPath)) {
  // Use a default icon or let menubar handle it
  iconPath = undefined;
}

const mb = menubar({
  index: `file://${path.join(__dirname, 'index.html')}`,
  icon: iconPath,
  tooltip: 'Task Manager',
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

mb.on('ready', () => {
  console.log('Task Manager is ready');
});

// Track window state to prevent race conditions
let blurTimeout = null;
let lastShowTime = 0;
const SHOW_COOLDOWN = 300; // ms to wait after show before allowing blur to hide

mb.on('after-create-window', () => {
  console.log('Window created');
  mb.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mb.window.setAlwaysOnTop(true, 'floating');

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
  if (mb.window && !mb.window.isDestroyed()) {
    // Ensure window is shown and focused
    if (!mb.window.isVisible()) {
    mb.window.show();
    }
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

const { app, ipcMain } = require('electron');
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

mb.on('after-create-window', () => {
  console.log('Window created');
  mb.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mb.window.setAlwaysOnTop(true, 'floating');

  // Close window when it loses focus
  mb.window.on('blur', () => {
    console.log('Window lost focus, hiding');
    if (mb.window) {
      mb.window.hide();
    }
  });
});

mb.on('show', () => {
  console.log('Window shown');
  if (mb.window) {
    mb.window.show();
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



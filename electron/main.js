import { app, BrowserWindow, Tray, Menu } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let tray;
let isQuitting = false;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

app.on('second-instance', (event, commandLine, workingDirectory) => {
  if (!mainWindow) {
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();

  // Handle Windows deep link (e.g. ananke://auth/callback#access_token=...)
  const deepLink = commandLine.find(arg => arg.startsWith('ananke://'));
  if (deepLink) {
    handleDeepLink(deepLink);
  }
});

// Handle macOS deep link
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

function handleDeepLink(url) {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();

    try {
      // url example: ananke://auth/callback#access_token=...
      const hash = url.includes('#') ? '#' + url.split('#')[1] : '';
      
      if (hash) {
        const startUrl = app.isPackaged ? 'https://ananke.vercel.app' : 'http://localhost:5173';
        const finalUrl = `${startUrl}/${hash}`;
        mainWindow.loadURL(finalUrl);
      }
    } catch (e) {
      console.error('Failed to handle deep link:', e);
    }
  }
}

// Register the custom protocol ananke://
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('ananke', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('ananke');
}

app.setAppUserModelId('com.ananke.app');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    title: 'Ananke - Productivity Enforcement Engine',
    icon: path.join(__dirname, '../public/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false,
    },
    autoHideMenuBar: true,
  });

  Menu.setApplicationMenu(null);

  const startUrl = app.isPackaged ? 'https://ananke.vercel.app' : 'http://localhost:5173';
  
  // Check if we were launched with a deep link
  const deepLink = process.argv.find(arg => arg.startsWith('ananke://'));
  if (deepLink) {
    const hash = deepLink.includes('#') ? '#' + deepLink.split('#')[1] : '';
    mainWindow.loadURL(`${startUrl}/${hash}`);
  } else {
    mainWindow.loadURL(startUrl);
  }

  // Intercept window.open to open URLs securely in the user's external default browser instead of an Electron popup
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      import('electron').then(({ shell }) => shell.openExternal(url));
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    const key = input.key?.toUpperCase();
    const isDevToolsShortcut =
      key === 'F12' ||
      (input.control && input.shift && (key === 'I' || key === 'J' || key === 'C'));

    if (isDevToolsShortcut) {
      event.preventDefault();
    }
  });

  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.webContents.closeDevTools();
  });

  mainWindow.on('close', (event) => {
    if (isQuitting) {
      return;
    }

    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, '../public/icon.ico'));
  tray.setToolTip('Ananke');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Open Ananke',
        click: () => {
          if (!mainWindow) {
            createWindow();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      {
        label: 'Quit',
        click: () => {
          isQuitting = true;
          if (mainWindow) {
            mainWindow.destroy();
          }
          app.quit();
        },
      },
    ])
  );

  tray.on('click', () => {
    if (!mainWindow) {
      createWindow();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

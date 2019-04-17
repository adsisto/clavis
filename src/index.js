/*
 * Clavis
 * Copyright (c) 2019 Andrew Ying
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of version 3 of the GNU General Public License as published by the
 * Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const { app, BrowserWindow, Menu, Tray } = require('electron');

const Store = require('electron-store');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const storeSchema = {
  ready: { type: 'boolean', default: false },
  startOnBoot: { type: 'boolean', default: true },
  hiddenOnStart: { type: 'boolean', default: true },
  identity: { type: 'string', format: 'email' },
  publicKey: { type: 'string' },
  hotKey: { type: 'string' }
};

// Keep a global reference of the window object
let store;
let mainWindow;
let tray;

store = new Store({
  schema: storeSchema
});
app.setLoginItemSettings({
  openAtLogin: store.get('startOnBoot', true),
  openAsHidden: store.get('hiddenOnStart', true),
});

const setupWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 500,
    height: 300,
    resizable: false,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

const trayMenu = Menu.buildFromTemplate([
  {
    label: 'Open',
    type: 'normal',
    click: () => {
      if (mainWindow === null) {
        setupWindow();
      }
    }
  },
  {
    label: 'About',
    type: 'normal'
  },
  {
    label: 'Exit',
    type: 'normal'
  }
]);

const setUpTray = () => {
  // Create the tray menu.
  tray = new Tray(`${__dirname}/images/tray/icon.png`);
  tray.setToolTip(app.getName());
  tray.setContextMenu(trayMenu);

  // Create event listener.
  tray.on('click', () => {
    this.popUpContextMenu();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  if (process.platform === 'darwin') {
    // app.dock.hide();
  }

  setUpTray();
  setupWindow();
});

app.on('activate', () => {
  if (mainWindow === null) {
    setupWindow();
  }
});

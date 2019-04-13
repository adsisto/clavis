/*
 * Copyright (c) Andrew Ying 2019.
 *
 * This file is part of Clavis.
 *
 * Clavis is free software. You can use, share, and build it under the terms of the
 * API Copyleft License. As far as the law allows, this software comes as is, without
 * any warranty or condition, and no contributor will be liable to anyone for any
 * damages related to this software or this license, under any kind of legal claim.
 *
 * A copy of the API Copyleft License is available at <LICENSE.md>.
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
    width: 800,
    height: 600,
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
    app.dock.hide();
  }

  setUpTray();
  setupWindow();
});

app.on('activate', () => {
  if (mainWindow === null) {
    setupWindow();
  }
});

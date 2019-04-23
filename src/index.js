/*
 * Clavis
 * Copyright (c) 2019 Andrew Ying
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of version 3 of the GNU General Public License as published by the
 * Free Software Foundation. In addition, this program is also subject to certain
 * additional terms available at <SUPPLEMENT.md>.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { app, BrowserWindow, Menu, Tray, shell, globalShortcut } from 'electron';
import Store from 'electron-store';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const storeSchema = {
  ready: { type: 'boolean', default: false },
  startOnBoot: { type: 'boolean', default: true },
  hiddenOnStart: { type: 'boolean', default: true },
  identity: { type: 'string' },
  publicKey: { type: 'string' },
  hotKey: { type: 'string' }
};

// Keep a global reference of the window object
let store;
let mainWindow = null;
let tray;
let aboutWindow = null;

store = new Store({
  schema: storeSchema
});
app.setLoginItemSettings({
  openAtLogin: store.get("startOnBoot", true),
  openAsHidden: store.get("hiddenOnStart", true),
});

const appMenu = Menu.buildFromTemplate([
  {
    label: "Clavis",
    submenu: [
      {
        label: "About Clavis",
        type: "normal",
        click: () => {
          if (aboutWindow === null) {
            setupAboutWindow();
          } else {
            aboutWindow.focus();
          }
        }
      },
      { type: "separator" },
      { role: "quit" },
    ]
  },
  { role: "editMenu" },
]);

const setupWindow = () => {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 300,
    show: false,
    resizable: false,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      nodeIntegration: true,
    }
  });
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const setupAboutWindow = () => {
  aboutWindow = new BrowserWindow({
    width: 500,
    height: 300,
    show: false,
    resizable: false,
    title: "",
    webPreferences: {
      nodeIntegration: false,
    }
  });
  aboutWindow.loadURL(`file://${__dirname}/about.html`);

  aboutWindow.once('ready-to-show', () => {
    aboutWindow.show();
  });

  aboutWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });

  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });
};

const trayMenu = Menu.buildFromTemplate([
  {
    label: "Open",
    type: "normal",
    click: () => {
      if (mainWindow === null) {
        setupWindow();
      } else {
        mainWindow.focus();
      }
    }
  },
  {
    label: "About",
    type: "normal",
    click: () => {
      if (aboutWindow === null) {
        setupAboutWindow();
      } else {
        aboutWindow.focus();
      }
    }
  },
  {
    label: "Quit",
    role: "quit",
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

app.on('ready', () => {
  setUpTray();
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  setupWindow();
  Menu.setApplicationMenu(appMenu);
});

app.on('activate', () => {
  if (mainWindow === null) {
    setupWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
});

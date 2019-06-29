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

import { BrowserWindow, ipcMain, shell, dialog } from 'electron';
import Store from 'electron-store';

const keyStore = new Store({
  name: 'trustedHosts'
});

export const setupWindow = (args) => {
  let mainWindow = new BrowserWindow({
    width: 500,
    height: 300,
    show: false,
    resizable: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
    }
  });

  if (typeof(args) !== 'undefined') {
    mainWindow.loadURL(`file://${ __dirname }/index.html${ args }`);
  } else {
    mainWindow.loadURL(`file://${ __dirname }/index.html`);
  }

  ipcMain.on('key-mismatch', (event, args) => {
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      buttons: [ 'Cancel', 'Remove Old Key' ],
      message: 'Host key mismatch',
      detail: `The host at ${ args.host } was previously trusted but has now presented`
        + ' a different key. If this is not expected, do not continue as it may be '
        + 'a man-in-the-middle attack. Otherwise, you can continue to remove the '
        + 'old public key.',
      cancelId: 0
    }, (response) => {
      switch (response) {
      case 1:
        keyStore.delete(args.url);
      }
    });
  });

  ipcMain.on('show-exception', (event, args) => {
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      buttons: ['OK'],
      message: args.message,
      detail: args.detail,
      cancelId: 0
    }, () => {});
  });

  ipcMain.on('close-current-window', () => {
    mainWindow.close();
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
};

export const setupAboutWindow = () => {
  let aboutWindow = new BrowserWindow({
    width: 500,
    height: 300,
    show: false,
    resizable: false,
    title: '',
    webPreferences: {
      nodeIntegration: false,
    }
  });
  aboutWindow.loadURL(`file://${ __dirname }/about.html`);

  aboutWindow.once('ready-to-show', () => {
    aboutWindow.show();
  });

  aboutWindow.webContents.on('new-window', function (e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });

  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });

  return aboutWindow;
};

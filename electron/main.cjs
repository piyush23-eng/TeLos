const { app, BrowserWindow } = require('electron');
const path = require('path');

const createWindow = () => {
  const window = new BrowserWindow({
    width: 1440, height: 940, minWidth: 1120, minHeight: 760,
    titleBarStyle: 'hiddenInset', backgroundColor: '#0b1020',
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  const url = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
  window.loadURL(url);
};
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

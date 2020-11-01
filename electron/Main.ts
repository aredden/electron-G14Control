/** @format */

import { app, BrowserWindow, ipcMain } from 'electron';
import { buildIpcConnection } from './IPCEvents/IPCListeners';
import { buildEmitters } from './IPCEvents/ThermalEmitter';
import getLogger from './Logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = getLogger('Main');

function createWindow() {
	// Create the browser window.
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		resizable: true,
		webPreferences: {
			nodeIntegration: true,
			accessibleTitle: 'G14ControlR4',
			preload: __dirname + '/Preload.js',
		},
		darkTheme: true,
	});
	const ipc = ipcMain;
	buildIpcConnection(ipc, win);
	buildEmitters(ipc, win);
	// and load the index.html of the app.
	win.loadURL('http://localhost:3000/');
}

app.on('ready', createWindow);

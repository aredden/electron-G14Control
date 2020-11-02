/** @format */

import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import { buildIpcConnection } from './IPCEvents/IPCListeners';
import { buildEmitters } from './IPCEvents/IPCEmitters';
import getLogger from './Logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = getLogger('Main');

let tray: Tray;

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

app.on('window-all-closed', () => {
	// TODO: stop timeout looping from IPCEmitters.
	LOGGER.info('window closed');
});

app.on('ready', createWindow);
app.whenReady().then(() => {
	// TODO: FIll out full tray app functionality.
	tray = new Tray('C:\\temp\\icon_light.png');
	const contextMenu = Menu.buildFromTemplate([
		{ label: 'Item1', type: 'radio' },
		{ label: 'Item2', type: 'radio' },
		{ label: 'Item3', type: 'radio', checked: true },
		{ label: 'Item4', type: 'radio' },
		{
			label: 'Quit',
			type: 'normal',
			click: () => {
				app.quit();
			},
		},
	]);
	tray.setToolTip('This is my application.');
	tray.setContextMenu(contextMenu);
});

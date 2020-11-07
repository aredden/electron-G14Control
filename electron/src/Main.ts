/** @format */

import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import { buildIpcConnection } from './IPCEvents/IPCListeners';
import { buildEmitters, killEmitters } from './IPCEvents/IPCEmitters';
import getLogger from './Logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = getLogger('Main');
let browserWindow: BrowserWindow;
let showIconEnabled = false;
let tray: Tray;
let trayContext: Menu;
function createWindow() {
	// Create the browser window.
	browserWindow = new BrowserWindow({
		width: 800,
		height: 600,
		resizable: true,
		titleBarStyle: 'hidden',
		autoHideMenuBar: true,
		frame: false,
		icon: 'assets/icon.ico',
		webPreferences: {
			nodeIntegration: true,
			accessibleTitle: 'G14ControlR4',
			preload: __dirname + '/Preload.js',
		},
		darkTheme: true,
	});
	const ipc = ipcMain;
	buildIpcConnection(ipc, browserWindow);
	buildEmitters(ipc, browserWindow);
	// and load the index.html of the app.
	browserWindow.loadURL('http://localhost:3000/');
}

app.on('window-all-closed', () => {
	// TODO: stop timeout looping from IPCEmitters.
	killEmitters();
	showIconEnabled = true;
	LOGGER.info('window closed');
});

app.on('ready', createWindow);
app.whenReady().then(() => {
	// TODO: FIll out full tray app functionality.
	tray = new Tray('C:\\temp\\icon_light.png');
	trayContext = Menu.buildFromTemplate([
		{
			label: 'Show App',
			type: 'normal',
			enabled: showIconEnabled,
			click: (item) => {
				browserWindow.show();
				browserWindow.webContents.reload();
				item.enabled = !item.enabled;
				item.menu.items[1].enabled = !item.enabled;
			},
		},
		{
			label: 'Hide App',
			type: 'normal',
			enabled: !showIconEnabled,
			click: (item) => {
				killEmitters();
				browserWindow.hide();
				item.enabled = !item.enabled;
				item.menu.items[0].enabled = !item.enabled;
			},
		},
		{
			label: 'Quit',
			type: 'normal',
			click: () => {
				app.quit();
			},
		},
	]);
	tray.setToolTip('This is my application.');
	tray.setContextMenu(trayContext);
});

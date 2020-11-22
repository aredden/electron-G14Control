/** @format */

import {
	app,
	BrowserWindow,
	ipcMain,
	Menu,
	Tray,
	Notification,
} from 'electron';
import { buildIpcConnection } from './IPCEvents/IPCListeners';
import { buildEmitters, killEmitters } from './IPCEvents/IPCEmitters';
import installExtension, {
	REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';
import getLogger from './Logger';
import path from 'path';
import url from 'url';
import is_dev from 'electron-is-dev';
import { buildTrayIcon } from './TrayIcon';

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	app.quit();
} else {
	app.on('second-instance', () => {
		new Notification({
			title: 'G14Control',
			body: 'Only one instance of G14Control can be run at a time!',
		}).show();
		if (browserWindow) {
			if (browserWindow.isMinimized()) browserWindow.restore();
			browserWindow.focus();
		}
	});
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = getLogger('Main');
let browserWindow: BrowserWindow;
export let showIconEnabled = false;
export let tray: Tray;
export let trayContext: Menu;

export const updateMenuVisible = (minimized?: boolean) => {
	if (browserWindow.isMinimized) {
		trayContext.getMenuItemById('showapp').enabled = true;
		trayContext.getMenuItemById('hideapp').enabled = false;
	} else {
		trayContext.getMenuItemById('showapp').enabled = false;
		trayContext.getMenuItemById('hideapp').enabled = true;
	}
};

function createWindow() {
	// Create the browser window.

	browserWindow = new BrowserWindow({
		width: 960,
		height: 600,
		resizable: true,
		maxWidth: is_dev ? 1920 : 1300,
		minWidth: 960,
		titleBarStyle: 'hidden',
		autoHideMenuBar: true,
		frame: false,
		icon: './assets/icon.ico',
		webPreferences: {
			allowRunningInsecureContent: false,
			worldSafeExecuteJavaScript: true,
			nodeIntegration: true,
			accessibleTitle: 'G14ControlR4',
			preload: __dirname + '/Preload.js',
		},
		darkTheme: true,
	});
	if (is_dev) {
		installExtension(REACT_DEVELOPER_TOOLS)
			.then((name) => console.log(`Added Extension:  ${name}`))
			.catch((err) => console.log('An error occurred adding devtools: ', err));
	}
	const ipc = ipcMain;
	ipc.setMaxListeners(35);
	buildIpcConnection(ipc, browserWindow);
	buildEmitters(ipc, browserWindow);
	// and load the index.html of the app.
	let loadurl = 'http://localhost:3000/';
	if (!is_dev) {
		browserWindow.loadURL(
			url.format({
				pathname: path.join(__dirname, './index.html'),
				protocol: 'file:',
				slashes: true,
			})
		);
	} else {
		browserWindow.loadURL(loadurl);
	}
}

export default app;

app.on('window-all-closed', () => {
	// TODO: stop timeout looping from IPCEmitters.
	//killEmitters();
	showIconEnabled = true;
	updateMenuVisible();
	LOGGER.info('window closed');
});

app.on('quit', (evt) => {
	killEmitters();
	// tray.destroy();
	process.exit(0);
});

app.on('ready', createWindow);

app.whenReady().then(() => {
	let results = buildTrayIcon(tray, trayContext, browserWindow);
	tray = results.tray;
	trayContext = results.trayContext;
	browserWindow = results.browserWindow;
});

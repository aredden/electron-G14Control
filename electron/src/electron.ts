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
import { resetGPU } from './IPCEvents/gpu/gpu';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = getLogger('Main');
let browserWindow: BrowserWindow;
let showIconEnabled = false;
let tray: Tray;
let trayContext: Menu;
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
	killEmitters();
	showIconEnabled = true;
	updateMenuVisible();
	LOGGER.info('window closed');
});

app.on('quit', (evt) => {
	killEmitters();
	tray.destroy();
	process.exit(0);
});

app.on('ready', createWindow);

app.whenReady().then(() => {
	// TODO: FIll out full tray app functionality.
	tray = new Tray('C:\\temp\\icon_light.png');
	tray.on('click', (ev, bounds) => {
		browserWindow.show();
	});
	trayContext = Menu.buildFromTemplate([
		{
			label: 'Show App',
			type: 'normal',
			id: 'showapp',
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
			id: 'hideapp',
			enabled: !showIconEnabled,
			click: (item) => {
				killEmitters();
				browserWindow.hide();
				item.enabled = !item.enabled;
				item.menu.items[0].enabled = !item.enabled;
			},
		},
		{
			type: 'separator',
		},
		{
			label: 'Reset GPU',
			type: 'normal',
			click: () => {
				resetGPU().then((value) => {
					new Notification({
						title: 'G14Control',
						body: 'GPU Successfully Reset.',
					}).show();
				});
			},
		},
		{
			type: 'separator',
		},
		{
			label: 'Reset Renderer',
			type: 'normal',
			click: (item) => {
				killEmitters();
				browserWindow.reload();
			},
		},
		{
			label: 'Quit',
			type: 'normal',
			click: () => {
				tray.closeContextMenu();
				tray.destroy();
				app.quit();
			},
		},
	]);
	tray.setToolTip('G14Control');
	tray.setContextMenu(trayContext);
});

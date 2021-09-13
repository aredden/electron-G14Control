/** @format */

import { BrowserWindow, ipcMain, globalShortcut, Tray } from 'electron';
import { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import url from 'url';
import path from 'path';
import { setHidMain, updateMenuVisible } from './electron';
import { loadConfig } from './IPCEvents/ConfigLoader';
import { setUpNewG14ControlKey } from './IPCEvents/HID/HIDDevice';
import {
	buildEmitters,
	loopsAreRunning,
	killEmitters,
	runLoop,
} from './IPCEvents/IPCEmitters';
import { buildIpcConnection } from './IPCEvents/IPCListeners';
import { ROGmapperBuilder } from './IPCEvents/RogKeyRemapperListener';
import { buildTrayIcon } from './TrayIcon';
import is_dev from 'electron-is-dev';
import getLogger from './Logger';
import installExtension from 'electron-devtools-installer';
import { HID } from 'node-hid';

const LOGGER = getLogger('Browser');

export async function createWindow(
	gotTheLock: any,
	g14Config: G14Config,
	browserWindow: BrowserWindow,
	tray: Tray,
	trayContext: any,
	ICONPATH: string,
	hid: HID
) {
	// Create the browser window.
	if (!gotTheLock) {
		return;
	}

	try {
		g14Config = JSON.parse((await loadConfig()).toString()) as G14Config;
	} catch (err) {
		LOGGER.error('Error loading config at startup');
	}

	browserWindow = new BrowserWindow({
		width: 960,
		height: 600,
		resizable: true,
		maxWidth: is_dev ? 1920 : 1300,
		minWidth: 960,
		titleBarStyle: 'hidden',
		autoHideMenuBar: true,
		frame: false,
		icon: ICONPATH,

		webPreferences: {
			allowRunningInsecureContent: false,
			worldSafeExecuteJavaScript: true,
			accessibleTitle: 'G14ControlV2',
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

	// build tray icon menu
	let results = await buildTrayIcon(tray, trayContext, browserWindow);

	tray = results.tray;
	trayContext = results.trayContext;
	browserWindow = results.browserWindow;

	// set up renderer process events.
	browserWindow.on('hide', async () => {
		if (loopsAreRunning()) {
			await killEmitters();
		}
		updateMenuVisible();
	});
	browserWindow.on('show', () => {
		if (!loopsAreRunning()) {
			runLoop(browserWindow);
		}
		updateMenuVisible();
	});
	browserWindow.on('minimize', async () => {
		if (loopsAreRunning()) {
			await killEmitters();
		}
		updateMenuVisible();
	});
	browserWindow.on('restore', () => {
		if (!loopsAreRunning()) {
			runLoop(browserWindow);
		}
		updateMenuVisible();
	});
	browserWindow.on('unresponsive', () => {
		LOGGER.info('Window is unresponsive...');
		browserWindow.webContents.reload();
	});

	let { shortcuts, rogKey } = g14Config.current;

	// Register global shortcut ctrl + space
	if (shortcuts.minmax.enabled) {
		let registered = globalShortcut.register(
			shortcuts.minmax.accelerator,
			() => {
				if (browserWindow.isFocused()) {
					browserWindow.minimize();
				} else {
					browserWindow.show();
				}
			}
		);
		if (registered) {
			LOGGER.info('Show app shortcut registered.');
		} else {
			LOGGER.info('Error registering shortcut.');
		}
	}

	if (rogKey.enabled) {
		let hdd = await setUpNewG14ControlKey(ROGmapperBuilder);
		if (hdd) {
			setHidMain(hdd);
			LOGGER.info('ROG key HID built and listening.');
		} else {
			LOGGER.info('There was an issue setting up ROG HID');
		}
	}

	return { tray, browserWindow, g14Config, trayContext };
}

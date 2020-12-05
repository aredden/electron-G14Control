/** @format */

import {
	app,
	BrowserWindow,
	Menu,
	Tray,
	Notification,
	globalShortcut,
	powerMonitor,
} from 'electron';

import getLogger from './Logger';
import path from 'path';
import is_dev from 'electron-is-dev';
import { killEmitters } from './IPCEvents/IPCEmitters';
import { createWindow } from './Browser';
import { HID } from 'node-hid';

const gotTheLock = app.requestSingleInstanceLock();

export let g14Config: G14Config;
export const setG14Config = (g14conf: G14Config) => {
	g14Config = g14conf;
};

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

const ICONPATH = is_dev
	? path.join(__dirname, '../', 'src', 'assets', 'icon.ico')
	: path.join(
			app.getPath('exe'),
			'../',
			'resources',
			'extraResources',
			'icon.ico'
	  );

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = getLogger('Main');
export let browserWindow: BrowserWindow;
export let showIconEnabled = false;
export let tray: Tray;
export let trayContext: Menu;
export let hid: HID;
if (is_dev) {
	LOGGER.info('Running in development');
} else {
	LOGGER.info('Running in production');
}

export const minMaxFunc = () => {
	if (browserWindow.isFocused()) {
		browserWindow.minimize();
	} else {
		browserWindow.show();
	}
};

export const getROGHID = () => hid;

export const setHidMain = (hiddevice: HID) => {
	LOGGER.info('Updating state of rogKey hid device.');
	hid = hiddevice;
};

export const updateMenuVisible = (minimized?: boolean) => {
	if (browserWindow.isMinimized() || !browserWindow.isVisible()) {
		trayContext.getMenuItemById('showapp').enabled = true;
		trayContext.getMenuItemById('hideapp').enabled = false;
	} else {
		trayContext.getMenuItemById('showapp').enabled = false;
		trayContext.getMenuItemById('hideapp').enabled = true;
	}
};

powerMonitor.on('shutdown', () => {
	app.quit();
});

app.on('window-all-closed', async () => {
	await killEmitters();
	showIconEnabled = true;
	updateMenuVisible();
	LOGGER.info('window closed');
});

app.on('before-quit', async () => {
	globalShortcut.unregisterAll();
	LOGGER.info('Keyboard shortcuts unregistered.');
	LOGGER.info('Preparing to quit.');
	killEmitters();
});

app.on('quit', async (evt, e) => {
	LOGGER.info(`Quitting with exit code. ${e}`);
});

app.on('ready', async () => {
	let results = await createWindow(
		gotTheLock,
		g14Config,
		browserWindow,
		tray,
		trayContext,
		ICONPATH,
		hid
	);

	g14Config = results.g14Config;
	tray = results.tray;
	browserWindow = results.browserWindow;
	trayContext = results.trayContext;
});

app.on('renderer-process-crashed', (event, webcontents, killed) => {
	LOGGER.info(
		`Renderer process crashed: ${JSON.stringify(
			event,
			null,
			2
		)}\nWas killed? ${killed} ... ${killed ? 'RIP' : ''}`
	);
});

app.on('render-process-gone', (event, contents, details) => {
	LOGGER.info(`Renderer Process is Gone:\n${details.reason}`);
});

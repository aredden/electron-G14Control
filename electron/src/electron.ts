/** @format */

import {
	app,
	BrowserWindow,
	Menu,
	Tray,
	globalShortcut,
	powerMonitor,
	ipcMain,
	Notification,
} from 'electron';

import getLogger from './Logger';
import path from 'path';
import is_dev from 'electron-is-dev';
import {
	buildEmitters,
	killEmitters,
	loopsAreRunning,
	runLoop,
} from './IPCEvents/IPCEmitters';
import { HID } from 'node-hid';
import { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import url from 'url';
import { buildPath, loadConfig, writeConfig } from './IPCEvents/ConfigLoader';
import { setUpNewG14ControlKey } from './IPCEvents/HID/HIDDevice';
import { buildIpcConnection } from './IPCEvents/IPCListeners';
import { mapperBuilder } from './IPCEvents/RogKeyRemapperListener';
import { buildTrayIcon } from './TrayIcon';
import installExtension from 'electron-devtools-installer';
import forceFocus from 'forcefocus';
import AutoUpdater from './AppUpdater';
import { isUndefined } from 'lodash';
import { buildTaskbarMenu } from './Taskbar';
import { NotificationConstructorOptions } from 'electron/main';
import { initSwitch } from './AutoPowerSwitching';
const LOGGER = getLogger('Main');
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
	LOGGER.info('Another process had the lock, quitting!');
	app.exit();
}

export let g14Config: G14Config;
export const setG14Config = (g14conf: G14Config) => {
	g14Config = g14conf;
};

const ICONPATH = is_dev
	? path.join(__dirname, '../', 'src', 'assets', 'icon.ico')
	: path.join(
			app.getPath('exe'),
			'../',
			'resources',
			'extraResources',
			'icon.ico'
	  );

export let powerDelivery: 'battery' | 'ac' = 'ac';
export const getPowerDelivery = () => powerDelivery;
export const setPowerDelivery = (val: 'battery' | 'ac') =>
	(powerDelivery = val);

export let browserWindow: BrowserWindow;
export let showIconEnabled = false;
export let tray: Tray;
export let trayContext: Menu;
export let hid: HID;
export let updateNote: AutoUpdater<{}>;
if (is_dev) {
	LOGGER.info('Running in development');
} else {
	LOGGER.info('Running in production');
}

export const getConfig = () => g14Config;

export const minMaxFunc = () => {
	if (browserWindow.isVisible() && browserWindow.isFocused()) {
		let conf = getConfig();
		conf.current.minToTray ? browserWindow.hide() : browserWindow.minimize();
	} else {
		LOGGER.info('Attempting to force focus to the browserWindow');
		if (browserWindow) {
			browserWindow.show();
			forceFocus.focusWindow(browserWindow);
			browserWindow.show();
		} else {
			LOGGER.info("browserWindow didn't exist.");
		}
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

const args = process.argv;

// eslint-disable-next-line
const showNotification = (title: string, body: string) => {
	const notification: NotificationConstructorOptions = {
		icon: ICONPATH,
		title: title,
		body: body,
		silent: false,
		timeoutType: 'default',
	};
	new Notification(notification).show();
};

export const buildBrowserListeners = (browserWindow: BrowserWindow) => {
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
};

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
		app.quit();
	}

	await buildPath();

	// load the config
	try {
		g14Config = JSON.parse((await loadConfig()).toString()) as G14Config;
	} catch (err) {
		LOGGER.error('Error loading config at startup');
	}
	// logic for start on boot minimized
	let startWithFocus = true;
	if (args.length > 1 && args[1] === 'hide') {
		LOGGER.info('Starting with hidden browser Window');
		if (isUndefined(g14Config.startup.startMinimized)) {
			g14Config.startup['startMinimized'] = true;
			writeConfig(g14Config);
		}
		if (g14Config.startup.startMinimized) {
			startWithFocus = false;
		}
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
		show: startWithFocus,
		webPreferences: {
			allowRunningInsecureContent: false,
			worldSafeExecuteJavaScript: true,
			accessibleTitle: 'G14ControlV2',
			preload: __dirname + '/Preload.js',
			enableRemoteModule: true,
		},
		darkTheme: true,
	});

	// install dev tools
	if (is_dev) {
		installExtension(REACT_DEVELOPER_TOOLS)
			.then((name: any) => console.log(`Added Extension:  ${name}`))
			.catch((err: any) =>
				console.log('An error occurred adding devtools: ', err)
			);
	}

	// create ipc and modify listeners
	const ipc = ipcMain;
	ipc.setMaxListeners(35);
	browserWindow.setMaxListeners(35);
	app.setMaxListeners(35);
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

	buildBrowserListeners(browserWindow);
	ipcMain.handle('getVersion', () => {
		return app.getVersion();
	});

	ipcMain.once('isLoaded', () => {
		LOGGER.info('Renderer process built and updater being initialized...');
		updateNote = new AutoUpdater<{}>(browserWindow, ipcMain);
		updateNote.checkForUpdate();
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
		let hdd = setUpNewG14ControlKey(mapperBuilder);
		if (hdd) {
			setHidMain(hdd);
			LOGGER.info('ROG key HID built and listening.');
		} else {
			LOGGER.info('There was an issue setting up ROG HID');
		}
	}
	browserWindow.setMenu(null);
	return { tray, browserWindow, g14Config, trayContext };
}

export const setupElectronReload = (config: G14Config) => {
	let { shortcuts, rogKey } = config.current;

	// Register global shortcut (example: ctrl + space)
	if (shortcuts.minmax.enabled) {
		globalShortcut.unregisterAll();
		let registered = globalShortcut.register(
			shortcuts.minmax.accelerator,
			minMaxFunc
		);
		if (registered) {
			LOGGER.info('Show app shortcut registered.');
		} else {
			LOGGER.info('Error registering shortcut.');
		}
	}

	if (rogKey.enabled && !hid) {
		let hdd = setUpNewG14ControlKey(mapperBuilder);
		if (hdd) {
			setHidMain(hdd);
			LOGGER.info('ROG key HID built and listening.');
		} else {
			LOGGER.info('There was an issue setting up ROG HID');
		}
	}
};

powerMonitor.on('shutdown', () => {
	LOGGER.info('Windows is shutting down (sent from powermonitor)');
	globalShortcut.unregisterAll();
	if (hid) {
		hid.close();
	}
	if (!tray.isDestroyed()) {
		tray.destroy();
	}
	if (!browserWindow.isDestroyed()) {
		browserWindow.destroy();
	}
	if (loopsAreRunning()) {
		killEmitters().then((ok) => {
			app.quit();
		});
	} else {
		app.quit();
	}
});

powerMonitor.on('suspend', () => {
	LOGGER.info('Windows is suspending (sent from powermonitor)');
	browserWindow.hide();
});

powerMonitor.on('on-ac', () => {
	if (
		g14Config.autoSwitch &&
		g14Config.autoSwitch.enabled &&
		g14Config.autoSwitch.acPlan
	) {
		initSwitch('ac');
	}
});

powerMonitor.on('on-battery', () => {
	if (
		g14Config.autoSwitch &&
		g14Config.autoSwitch.enabled &&
		g14Config.autoSwitch.dcPlan
	) {
		initSwitch('battery');
	}
});

app.on('window-all-closed', async () => {
	await killEmitters();
	showIconEnabled = true;
	updateMenuVisible();
	LOGGER.info('window closed');
});

app.on('before-quit', async () => {
	if (gotTheLock) {
		globalShortcut.unregisterAll();
		if (hid) {
			hid.close();
		}
		LOGGER.info('Keyboard shortcuts unregistered.');
		LOGGER.info('Preparing to quit.');
		killEmitters();
	}
	app.exit();
});

app.on('quit', async (evt, e) => {
	LOGGER.info(`Quitting with exit code. ${e}`);
});

app.on('ready', async () => {
	if (!gotTheLock) {
		app.quit();
	} else {
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
		browserWindow = await buildTaskbarMenu(browserWindow);
		browserWindow.on('close', (ev) => {
			ev.preventDefault();
			browserWindow.hide();
		});
	}
});

app.on('renderer-process-crashed', (event, webcontents, killed) => {
	LOGGER.info(
		`Renderer process crashed: ${JSON.stringify(
			event,
			null,
			2
		)}\nWas killed? ${killed} ... ${killed ? 'RIP' : ''}`
	);
	app.quit();
});

app.on('render-process-gone', (event, contents, details) => {
	LOGGER.info(`Renderer Process is Gone:\n${details.reason}`);
	app.quit();
});

app.on('second-instance', () => {
	if (browserWindow) {
		if (browserWindow.isMinimized()) browserWindow.restore();
		browserWindow.focus();
	}
	if (!gotTheLock) {
		app.exit();
	} else {
		LOGGER.info('Another process interupted my thoughts, how dare he!');
		new Notification({
			title: 'G14ControlV2',
			body: 'Only one process allowed at a time!',
			timeoutType: 'default',
			hasReply: false,
		}).show();
	}
});

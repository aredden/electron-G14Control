/** @format */

import {
	app,
	BrowserWindow,
	ipcMain,
	Menu,
	Tray,
	Notification,
	globalShortcut,
} from 'electron';

import installExtension, {
	REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';
import getLogger from './Logger';
import path from 'path';
import url from 'url';
import is_dev from 'electron-is-dev';
import { buildIpcConnection } from './IPCEvents/IPCListeners';
import {
	buildEmitters,
	killEmitters,
	loopsAreRunning,
	runLoop,
} from './IPCEvents/IPCEmitters';
import { buildTrayIcon } from './TrayIcon';
import { setAutoLaunch } from './AutoLaunch';
import { loadConfig } from './IPCEvents/ConfigLoader';

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

if (is_dev) {
	LOGGER.info('Running in development');
} else {
	LOGGER.info('Running in production');
}

export const updateMenuVisible = (minimized?: boolean) => {
	if (browserWindow.isMinimized() || !browserWindow.isVisible()) {
		trayContext.getMenuItemById('showapp').enabled = true;
		trayContext.getMenuItemById('hideapp').enabled = false;
	} else {
		trayContext.getMenuItemById('showapp').enabled = false;
		trayContext.getMenuItemById('hideapp').enabled = true;
	}
};

async function createWindow() {
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
			nodeIntegration: true,
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
	});

	// Register global shortcut ctrl + space
	if (g14Config.current.shortcuts.minmax.enabled) {
		let registered = globalShortcut.register('Control+Space', () => {
			if (browserWindow.isFocused()) {
				browserWindow.minimize();
			} else {
				browserWindow.show();
			}
		});
		if (registered) {
			LOGGER.info('Show app shortcut registered.');
		} else {
			LOGGER.info('Error registering shortcut.');
		}
	}
}

app.on('window-all-closed', async () => {
	await killEmitters();
	showIconEnabled = true;
	updateMenuVisible();
	LOGGER.info('window closed');
});

app.on('before-quit', async () => {
	globalShortcut.unregisterAll();
	LOGGER.info('Keyboard shortcuts unregistered.');
	if (!is_dev && g14Config.startup.autoLaunchEnabled) {
		setAutoLaunch(true);
	}
	LOGGER.info('Preparing to quit.');
	killEmitters();
});

app.on('quit', async (evt, e) => {
	LOGGER.info(`Quitting with exit code. ${e}`);
});

app.on('ready', createWindow);

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

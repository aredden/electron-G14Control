/** @format */

import { app, BrowserWindow, IpcMain, ipcMain } from 'electron';
import { exec } from 'child_process';
import { parsePlans } from './Utilities';
import getLogger from './Logger';

const LOGGER = getLogger('Main');

function buildComms(comms: IpcMain, window: BrowserWindow) {
	comms.on('getWindowsPlans', async () => {
		const prom = new Promise((resolve) => {
			exec('powercfg /l', (err, stdout, stderr) => {
				if (err) {
					LOGGER.error(
						`Error getting windows plans guid's from powercfg...\n${JSON.stringify(
							err,
							null,
							2
						)}`
					);
				}
				let parsed = parsePlans(stdout);
				resolve(parsed);
			});
		});
		let parsed = await prom;
		window.webContents.send('winplans', parsed);
	});

	comms.on('getActivePlan', async () => {
		exec('powercfg /getactivescheme', (err, out, stderr) => {
			if (!err) {
				let parsed = parsePlans(out);
				if (parsed.length === 1) {
					window.webContents.send('activeplan', parsed[0]);
				}
			} else {
				LOGGER.error(
					`Error getting active windows plan guid's from powercfg...\n${JSON.stringify(
						err,
						null,
						2
					)}`
				);
			}
		});
	});

	comms.on('setActivePlan', async (_event, guid: string) => {
		exec(`powercfg /setactive ${guid}`, (err, out, stderr) => {
			if (!err) {
				window.webContents.send('setActivePlanStatus', true);
			} else {
				LOGGER.error(JSON.stringify(err));
				window.webContents.send('setActivePlanStatus', false);
			}
		});
	});
}

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
	const comms = ipcMain;
	buildComms(comms, win);
	// and load the index.html of the app.
	win.loadURL('http://localhost:3000/');
}

app.on('ready', createWindow);

/** @format */

import { BrowserWindow, IpcMain, powerMonitor } from 'electron';
import { SMULoop } from './renoir-mobile/SMULoop';

import getLogger from '../Logger';

const LOGGER = getLogger('SMUMonitoringListener');

let monitor = new SMULoop();

const handleData = (data: SMUData[], win: BrowserWindow) => {
	win.webContents.send('smuData', data);
};

export const buildMonitoringListeners = (win: BrowserWindow, ipc: IpcMain) => {
	ipc.on('initMonitor', (evt) => {
		if (!monitor.alive()) {
			LOGGER.info('init monitor request.');
			monitor = new SMULoop();
			monitor.start();
			monitor.on('smuData', (data: SMUData[]) => handleData(data, win));
		}
	});
	ipc.on('killMonitor', (evt) => {
		if (monitor.alive()) {
			monitor.removeAllListeners();
			monitor.stop();
		}
	});
};
powerMonitor.on('lock-screen', () => {
	if (monitor.alive) {
		monitor.stop();
	}
});
powerMonitor.on('shutdown', () => {
	if (monitor.alive) {
		monitor.stop();
	}
});
powerMonitor.on('suspend', () => {
	if (monitor.alive) {
		monitor.stop();
	}
});

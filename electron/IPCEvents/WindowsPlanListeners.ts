/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import getLogger from '../Logger';
import {
	getActivePlan,
	getWindowsPlans,
	setWindowsPlan,
} from './powercfg/Powercfg';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = getLogger('WindowsPlanListeners');

export const buildWindowsPlanListeners = (
	comms: IpcMain,
	window: BrowserWindow
) => {
	comms.on('getWindowsPlans', async () => {
		let plans = await getWindowsPlans();
		if (plans) {
			window.webContents.send('winplans', plans);
		}
	});

	comms.on('getActivePlan', async () => {
		let active = await getActivePlan();
		if (active) {
			window.webContents.send('activeplan', active);
		}
	});

	comms.on(
		'setWindowsPlan',
		async (_event, datas: { name: string; guid: string }) => {
			let setResult = await setWindowsPlan(datas.guid);
			if (setResult) {
				window.webContents.send('setActivePlanStatus', {
					result: true,
					data: datas,
				});
			} else {
				window.webContents.send('setActivePlanStatus', { result: false });
			}
		}
	);
};

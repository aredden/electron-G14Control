/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import getLogger from '../Logger';
import { getCoresLoad } from './WMI/CPULoad';
import { getHighPrecisionTemperature } from './WMI/ThermalZone';
import cp from 'child_process';
import _, { isNull, template } from 'lodash';
let killTempLoop = false;
let killLoadLoop = false;

let tempLoop: cp.ChildProcessWithoutNullStreams;
let loadLoop: NodeJS.Timeout;

let tempLoopRunning = false;
let loadLoopRunning = false;

const LOGGER = getLogger('IPCEmitters');

export const killEmitters = () => {
	killTempLoop = true;
	killLoadLoop = true;
	clearTimeout(loadLoop);
	tempLoop.kill('SIGKILL');
	tempLoopRunning = false;
	loadLoopRunning = false;
};

export const buildEmitters = (ipc: IpcMain, window: BrowserWindow) => {
	ipc.on('cpuTempRun', (event, run: boolean) => {
		if (run) {
			if (!tempLoopRunning) {
				killTempLoop = false;
				tempLoopRunning = true;
				tempLoop = cp.spawn(
					`typeperf "\\Thermal Zone Information(*)\\High Precision Temperature"`,
					{
						shell: true,
						detached: false,
						windowsHide: true,
						windowsVerbatimArguments: true,
						cwd: '',
					}
				);
				tempLoop.stdout.on('readable', () => {
					let buff = tempLoop.stdout.read() as Buffer;
					if (!isNull(buff)) {
						let value = buff.toString();
						value = value.replaceAll(/"|,/gm, '');
						let matched = value.match(/[0-9]{4}\.[0-9]{0,5}/);
						if (!_.isNull(matched)) {
							window.webContents.send(
								'cpuTemperature',
								parseInt(matched[0]) / 10 - 276.15
							);
						}
					}
				});
				tempLoop.on('close', () => {
					LOGGER.info('closed..');
				});
				tempLoop.on('message', (message: string) => {
					LOGGER.info(message);
				});
				LOGGER.info('cpuTempRun event recieved.. running.');
			}
		} else {
			killTempLoop = true;
			tempLoopRunning = false;
			tempLoop.kill('SIGKILL');
			LOGGER.info('cpuTempRun event recieved.. terminated.');
		}
	});
	ipc.on('cpuLoadRun', (event, run: boolean) => {
		if (run) {
			if (!loadLoopRunning) {
				killLoadLoop = false;
				loadLoopRunning = true;
				getLoadLoop(window);
				LOGGER.info('cpuLoadRun event recieved.. running.');
			}
		} else {
			killLoadLoop = true;
			loadLoopRunning = false;
			clearTimeout(loadLoop);
			LOGGER.info('cpuLoadRun event recieved.. terminated.');
		}
	});
};

// const getTempLoop = (window: BrowserWindow) => {
// 	tempLoop = setTimeout(async () => {
// 		if (!killTempLoop) {
// 			let tempresult = await getHighPrecisionTemperature();
// 			if (tempresult) {
// 				let temp = tempresult[0]['HighPrecisionTemperature'] / 10 - 276.15;
// 				window.webContents.send('cpuTemperature', temp);
// 			}
// 			getTempLoop(window);
// 		}
// 	}, 700);
// };

const getLoadLoop = (window: BrowserWindow) => {
	loadLoop = setTimeout(async () => {
		if (!killLoadLoop) {
			let loadResult = await getCoresLoad();
			if (loadResult) {
				window.webContents.send('coresLoad', loadResult);
			}
			getLoadLoop(window);
		}
	}, 2000);
};

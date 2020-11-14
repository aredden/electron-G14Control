/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import getLogger from '../Logger';
import { getCoresLoad } from './WMI/CPULoad';
import cp from 'child_process';
import { spawnTypePerfThermalProcess } from './TempPerf/BuildCounter';
let killLoadLoop = false;

let tempLoop: cp.ChildProcessWithoutNullStreams;
let loadLoop: NodeJS.Timeout;

let tempLoopRunning = false;
let loadLoopRunning = false;

const LOGGER = getLogger('IPCEmitters');

export const killEmitters = () => {
	killLoadLoop = true;
	clearTimeout(loadLoop);
	if (tempLoop) {
		tempLoop.kill();
	}
	tempLoopRunning = false;
	loadLoopRunning = false;
};

export const buildEmitters = (ipc: IpcMain, window: BrowserWindow) => {
	ipc.on('cpuTempRun', (_event, run: boolean) => {
		if (run) {
			if (!tempLoopRunning) {
				tempLoopRunning = true;
				tempLoop = spawnTypePerfThermalProcess(window);
				LOGGER.info('cpuTempRun event recieved.. running.');
			}
		} else {
			tempLoopRunning = false;
			tempLoop.kill('SIGINT');
			LOGGER.info('cpuTempRun event recieved.. terminated.');
		}
	});
	ipc.on('cpuLoadRun', (_event, run: boolean) => {
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

const getLoadLoop = (window: BrowserWindow) => {
	loadLoop = setTimeout(async () => {
		if (!killLoadLoop) {
			let loadResult = await getCoresLoad().catch((err) => {
				LOGGER.error(
					'Error: promise rejected in getLoadLoop() / getCoresLoad function.'
				);
			});
			if (loadResult) {
				window.webContents.send('coresLoad', loadResult);
			}
			getLoadLoop(window);
		}
	}, 2000);
};

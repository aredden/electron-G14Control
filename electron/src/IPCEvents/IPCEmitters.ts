/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import getLogger from '../Logger';
import cp from 'child_process';
import { spawnTypePerfThermalProcess } from './TempPerf/BuildCounter';
import fkill from 'fkill';
let tempLoop: cp.ChildProcessWithoutNullStreams;
let loadLoop: NodeJS.Timeout;

let tempLoopRunning = false;
// let loadLoopRunning = false;

let killing = false;

export const loopsAreRunning = () => {
	return tempLoop && !tempLoop.killed;
};

const LOGGER = getLogger('IPCEmitters');

const forceBrutalMurder = async (pid: number) => {
	if (!killing) {
		killing = true;
		LOGGER.info('thing to kill:' + pid + ' our pid: ' + process.pid);
		try {
			await fkill(pid, { tree: true, force: true }).catch((err) => {
				LOGGER.info(err);
			});
		} catch (err) {
			LOGGER.info("Error killing process, (probably doesn't exist)");
		}

		killing = false;
	}
};

export const killEmitters = async () => {
	if (loadLoop) {
		clearTimeout(loadLoop);
	}
	if (tempLoop) {
		LOGGER.info('I am really really trying to kill this time...');
		tempLoop.stdout.pause();
		await forceBrutalMurder(tempLoop.pid);
		tempLoopRunning = false;
	}

	// loadLoopRunning = false;
};

export const runLoop = (window: BrowserWindow) => {
	if (!tempLoopRunning) {
		tempLoopRunning = true;
		tempLoop = spawnTypePerfThermalProcess(window);
		LOGGER.info('cpuTempRun event recieved.. running.');
	}
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
			forceBrutalMurder(tempLoop.pid);
			LOGGER.info('cpuTempRun event recieved.. terminated.');
		}
	});
};

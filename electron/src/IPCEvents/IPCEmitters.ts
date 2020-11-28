/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import getLogger from '../Logger';
import cp from 'child_process';
import { spawnTypePerfThermalProcess } from './TempPerf/BuildCounter';
import fkill from 'fkill';

function pidIsRunning(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch (e) {
		return false;
	}
}

let totalProcesses = [];
let tempLoop: cp.ChildProcessWithoutNullStreams;
let tempLoopRunning = false;

let killing = false;

export const loopsAreRunning = () => {
	return tempLoop && !tempLoop.killed && tempLoopRunning && !killing;
};

const LOGGER = getLogger('IPCEmitters');

const killProcess = async (pid: number) => {
	return new Promise(async (resolve) => {
		if (tempLoop) {
			killing = true;
			tempLoop.stdout.pause();
			LOGGER.info(
				'\nAttempting to kill: ' + pid + '\nG14Control pid: ' + process.pid
			);
			try {
				await fkill(pid, { tree: true, force: true })
					.catch((err) => {
						LOGGER.error(err);
						resolve(false);
					})
					.then((result) => {
						LOGGER.info(`Successfully killed TypePerf Process.`);
						killing = false;
						resolve(true);
					});
			} catch (err) {
				LOGGER.info("Error killing process, (probably doesn't exist)");
				resolve(false);
			}
		}
	});
};

export const killEmitters = async () => {
	LOGGER.info(
		`\nBEFORE Kill emiters loop Running: ${tempLoopRunning}\nis alive: ${loopsAreRunning()}\nkilling:${killing}`
	);
	if (loopsAreRunning()) {
		killing = true;
		LOGGER.info('Killing emitters...');
		tempLoop.stdout.pause();
		tempLoop.stderr.pause();
		let pid = tempLoop.pid;
		killProcess(tempLoop.pid).then((result) => {
			tempLoop = undefined;
			tempLoopRunning = false;
			killing = false;
			totalProcesses = totalProcesses.filter((val) => {
				return val !== pid;
			});
			LOGGER.info(
				`\nKill Result: ${result}\nrunning: ${tempLoopRunning}\nis alive: ${loopsAreRunning()}\nkilling:${killing}`
			);
		});
	}
};

export const runLoop = (window: BrowserWindow) => {
	if ((!tempLoopRunning || !loopsAreRunning()) && !killing) {
		tempLoopRunning = true;
		tempLoop = spawnTypePerfThermalProcess(window);
		totalProcesses.push(tempLoop.pid);
		LOGGER.info('cpuTempRun event recieved.. running.');
	}
};

export const buildEmitters = (ipc: IpcMain, window: BrowserWindow) => {
	ipc.on('cpuTempRun', (_event, run: boolean) => {
		if (run) {
			if (!tempLoopRunning) {
				tempLoopRunning = true;
				tempLoop = spawnTypePerfThermalProcess(window);
				totalProcesses.push(tempLoop.pid);
				LOGGER.info('cpuTempRun event recieved.. running.');
			}
		} else {
			if ((tempLoopRunning || loopsAreRunning()) && !killing) {
				killEmitters();
			}
		}
	});
};

export const checkProcesses = () => {
	setTimeout(() => {
		let checkList = [];
		totalProcesses.forEach((pid) => {
			if (pidIsRunning(pid)) {
				checkList.push(pid);
			}
		});
		LOGGER.info(
			`There are ${checkList.length} typeperf processes running. ${checkList}`
		);
		checkProcesses();
	}, 20000);
};

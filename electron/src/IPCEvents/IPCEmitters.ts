/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import getLogger from '../Logger';
import { buildPerfmonThermalProcess } from './TempPerf/Perfmon';
import type { PerfmonStream } from 'perfmon';
let started = false;
let isPaused = false;
let tempLoop: PerfmonStream;
export const loopsAreRunning = () => {
	return started && !isPaused && tempLoop;
};

const LOGGER = getLogger('IPCEmitters');

export const killEmitters = async () => {
	tempLoop.pause();
	isPaused = true;
	LOGGER.info('Perfmon paused.');
};

export const runLoop = (window: BrowserWindow) => {
	if (!started) {
		tempLoop = buildPerfmonThermalProcess(window);
		started = true;
		isPaused = false;
	} else if (!loopsAreRunning()) {
		tempLoop.resume();
		isPaused = false;
		LOGGER.info('Perfmon resumed.');
	}
};

export const buildEmitters = (ipc: IpcMain, window: BrowserWindow) => {
	ipc.on('cpuTempRun', (_event, run: boolean) => {
		if (run && !loopsAreRunning()) {
			runLoop(window);
			LOGGER.info('Perfmon loop started...');
		} else if (!run && loopsAreRunning()) {
			killEmitters();
		}
	});
};

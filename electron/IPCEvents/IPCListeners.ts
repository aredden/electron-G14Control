/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import { buildCPUBoostListeners } from './CPUBoostListeners';
import { buildRyzenADJListeners } from './RyzenADJListener';
import { buildWindowsPlanListeners } from './WindowsPlanListeners';

export function buildIpcConnection(ipc: IpcMain, win: BrowserWindow) {
	buildWindowsPlanListeners(ipc, win);
	buildCPUBoostListeners(ipc, win);
	buildRyzenADJListeners(ipc, win);
}

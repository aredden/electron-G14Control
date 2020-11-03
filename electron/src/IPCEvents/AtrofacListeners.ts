/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import { modifyFanCurve } from './atrofac/ModifyFan';
import { modifyArmoryCratePlan } from './atrofac/SetArmoryPlan';

export const buildAtrofacListeners = (ipc: IpcMain, win: BrowserWindow) => {
	ipc.on('setArmoryPlan', async (event, plan: ArmoryPlan) => {
		let resultOfArmoryPlan = await modifyArmoryCratePlan(plan);
		if (resultOfArmoryPlan) {
			win.webContents.send('setArmoryPlanResult', plan);
		} else {
			win.webContents.send('setArmoryPlanResult', false);
		}
	});
	ipc.on('setFanCurve', async (event, curve: string) => {
		let resultOfFanCurve = await modifyFanCurve(curve);
		if (resultOfFanCurve) {
			win.webContents.send('setFanCurveResult', resultOfFanCurve);
		} else {
			win.webContents.send('setFanCurveResult', false);
		}
	});
};

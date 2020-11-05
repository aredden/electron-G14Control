/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import { modifyFanCurve } from './atrofac/ModifyFan';
import { modifyArmoryCratePlan } from './atrofac/SetArmoryPlan';

const parseArrayCurve = (arrCurve: Array<number>) => {
	let curve = arrCurve
		.map((value, idx) => {
			return `${idx + 4}0c:${value}%`;
		})
		.join('');
	return curve;
};

export const buildAtrofacListeners = (ipc: IpcMain, win: BrowserWindow) => {
	ipc.on('setArmoryPlan', async (event, plan: ArmoryPlan) => {
		let resultOfArmoryPlan = await modifyArmoryCratePlan(plan);
		if (resultOfArmoryPlan) {
			win.webContents.send('setArmoryPlanResult', plan);
		} else {
			win.webContents.send('setArmoryPlanResult', false);
		}
	});

	ipc.handle(
		'setFanCurve',
		async (event, arrayCurve: { gpu?: Array<number>; cpu?: Array<number> }) => {
			let { cpu, gpu } = arrayCurve;

			let gpuCurve = gpu ? parseArrayCurve(gpu) : undefined;
			let cpuCurve = cpu ? parseArrayCurve(cpu) : undefined;
			let result = await modifyFanCurve(cpuCurve, gpuCurve);
			return result;
		}
	);
};

/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import getLogger from '../Logger';
import { modifyFanCurve } from './atrofac/ModifyFan';
import { modifyArmoryCratePlan } from './atrofac/SetArmoryPlan';

const LOGGER = getLogger('AtrofacListeners');

const parseArrayCurve = (arrCurve: Array<number>) => {
	let curve = arrCurve
		.map((value, idx) => {
			return `${idx + 3}0c:${value}%`;
		})
		.join(',');
	return curve;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const reverseParse = (curve: string) => {
	let reg = new RegExp(/([1]?[0-9]{1}0)c:([1]?[0-9]{1,2})%,?/, 'gm');
	let matches = Array.from(curve.match(reg));
	return Array.from(matches);
};

export const buildAtrofacListeners = (ipc: IpcMain, win: BrowserWindow) => {
	ipc.handle('setArmoryPlan', async (event, plan: ArmoryPlan) => {
		let resultOfArmoryPlan = await modifyArmoryCratePlan(plan);
		return resultOfArmoryPlan;
	});

	ipc.handle(
		'setFanCurve',
		async (
			event,
			arrayCurve: {
				gpu?: Array<number>;
				cpu?: Array<number>;
				plan?: ArmoryPlan;
			}
		) => {
			let { cpu, gpu } = arrayCurve;
			LOGGER.info(
				`Got gpu / gpu curve info: ${JSON.stringify(
					{ cpu: cpu.toString(), gpu: gpu.toString() },
					null,
					2
				)}`
			);
			let gpuCurve = gpu ? parseArrayCurve(gpu) : undefined;
			let cpuCurve = cpu ? parseArrayCurve(cpu) : undefined;
			let result = await modifyFanCurve(cpuCurve, gpuCurve);
			return result;
		}
	);
};

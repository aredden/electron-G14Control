/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import { getConfig } from './electron';
import getLogger from './Logger';
import { setG14ControlPlan } from './IPCEvents/G14ControlPlans';

const LOGGER = getLogger('AutoPowerSwitching');

export type PowerSwitchArgs = {
	enabled: boolean;
	acPlan: string;
	dcPlan: string;
};

const initSwitch = async (state: 'battery' | 'ac') => {
	let config = getConfig();
	if (!config.autoSwitch || !config.autoSwitch.enabled) {
		return;
	}
	let { acPlan, dcPlan } = config.autoSwitch;
	if (state === 'battery') {
		let ryz = dcPlan.ryzenadj
			? config.ryzenadj.options.find((val) => val.name === dcPlan.ryzenadj)
			: undefined;
		let fan = dcPlan.fanCurve
			? config.fanCurves.find((val) => val.name === dcPlan.fanCurve)
			: undefined;
		let fullPlan = Object.assign(dcPlan, {
			ryzenadj: ryz,
			fanCurve: fan,
		}) as FullG14ControlPlan;
		let result = await setG14ControlPlan(fullPlan);
		if (!result) {
			LOGGER.error(`Could not switch plan from AC to battery plan.`);
		}
	} else {
		let ryz = acPlan.ryzenadj
			? config.ryzenadj.options.find((val) => val.name === acPlan.ryzenadj)
			: undefined;
		let fan = acPlan.fanCurve
			? config.fanCurves.find((val) => val.name === acPlan.fanCurve)
			: undefined;
		let fullPlan = Object.assign(acPlan, {
			ryzenadj: ryz,
			fanCurve: fan,
		}) as FullG14ControlPlan;
		let result = await setG14ControlPlan(fullPlan);
		if (!result) {
			LOGGER.error(`Could not switch plan from battery to AC plan.`);
		}
	}
};

let currentBatteryState: 'battery' | 'ac' = 'ac';
export const checkForAutoSwitching = (discharge: number) => {
	if (discharge > 0 && currentBatteryState === 'ac') {
		initSwitch('battery');
		currentBatteryState = 'battery';
	} else if (discharge <= 1 && currentBatteryState === 'battery') {
		initSwitch('ac');
		currentBatteryState = 'ac';
	}
};

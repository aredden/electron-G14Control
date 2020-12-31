/** @format */

import { getConfig } from './electron';
import getLogger from './Logger';
import { setG14ControlPlan } from './IPCEvents/G14ControlPlans';
import { Notification } from 'electron';
const LOGGER = getLogger('AutoPowerSwitching');

export type PowerSwitchArgs = {
	enabled: boolean;
	acPlan: string;
	dcPlan: string;
};

export const initSwitch = async (state: 'battery' | 'ac') => {
	let config = getConfig();
	if (!config.autoSwitch || !config.autoSwitch.enabled) {
		return;
	}
	LOGGER.info('Auto Power Switching to: ' + state);
	let { acPlan, dcPlan } = config.autoSwitch;
	if (state === 'battery' && dcPlan) {
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
		} else {
			new Notification({
				title: 'Power Switching',
				body: 'Switched to plan:' + dcPlan.name,
			}).show();
		}
	} else if (acPlan) {
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
		} else {
			new Notification({
				title: 'Power Switching',
				body: 'Switched to plan:\n' + acPlan.name,
			}).show();
		}
	}
};

// export const checkForAutoSwitching = async (discharge: number) => {
// 	if (discharge > 0 && powerDelivery === 'ac') {
// 		let pow = await whichCharger();
// 		if (pow && pow.dc) {
// 			powerDelivery = 'battery';
// 			initSwitch('battery');
// 		}
// 	} else if (discharge <= 1 && powerDelivery === 'battery') {
// 		let pow = await whichCharger();
// 		if (pow && (pow.ac || pow.usb)) {
// 			powerDelivery = 'ac';
// 			initSwitch('ac');
// 		}
// 	}
// };

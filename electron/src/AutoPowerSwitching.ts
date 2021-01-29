/** @format */

import { getConfig, showNotification } from './electron';
import getLogger from './Logger';
import { setG14ControlPlan, current_plan } from './IPCEvents/G14ControlPlans';
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
		const fullPlan = {...dcPlan, ryzenadj: ryz, fanCurve: fan} as FullG14ControlPlan;
		let result = await setG14ControlPlan(fullPlan);
		if (!result) {
			LOGGER.error(`Could not switch plan from AC to battery plan.`);
		} else {
			showNotification('Power Switching', 'Switched to plan:' + dcPlan.name);
		}
	} else if (acPlan) {
		let ryz = acPlan.ryzenadj
			? config.ryzenadj.options.find((val) => val.name === acPlan.ryzenadj)
			: undefined;
		let fan = acPlan.fanCurve
			? config.fanCurves.find((val) => val.name === acPlan.fanCurve)
			: undefined;
		const fullPlan = {...acPlan, ryzenadj: ryz, fanCurve: fan} as FullG14ControlPlan;
		let result = await setG14ControlPlan(fullPlan);
		if (!result) {
			LOGGER.error(`Could not switch plan from battery to AC plan.`);
		} else {
			showNotification('Power Switching', 'Switched to plan:' + acPlan.name);
		}
	}
};

export const initF5Switch = async () => {
	let config = getConfig();
	if (!config.f5Switch || !config.f5Switch.enabled || !config.f5Switch.f5Plans) {
		return;
	}
	const plan_names: string[] = config.f5Switch.f5Plans;
	let old_plan_name = current_plan
	let new_plan_name = undefined
	let new_plan = undefined

	for (var x = 0; x < plan_names.length; x++) {
		if (plan_names[x] === current_plan || x === plan_names.length-1){
			new_plan_name = plan_names[(x+1) % plan_names.length]
			break
		}
	}
	for (let i = 0; i < config.plans.length; i++) {
		if (config.plans[i].name === new_plan_name){
			new_plan = config.plans[i]
		}
	}
	if (!new_plan_name || !new_plan ) {
		LOGGER.error(`Could not switch plans, no fitting plans found.`)
		return
	}
	LOGGER.info('Power Switching from: ' + old_plan_name + ' to ' + new_plan_name);
	let ryz = new_plan.ryzenadj
		? config.ryzenadj.options.find((val) => val.name === new_plan.ryzenadj)
		: undefined;
	let fan = new_plan.fanCurve
		? config.fanCurves.find((val) => val.name === new_plan.fanCurve)
		: undefined;
	const fullPlan = {...new_plan, ryzenadj: ryz, fanCurve: fan} as FullG14ControlPlan;
	let result = await setG14ControlPlan(fullPlan);
	if (!result) {
		LOGGER.error(`Could not switch plan.`);
	} else {
		showNotification('Manual Switching', 'Switched to: ' + new_plan.name);
	}
};

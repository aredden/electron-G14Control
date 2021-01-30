/** @format */

import { g14Config, getConfig, showNotification } from './electron';
import getLogger from './Logger';
import { setG14ControlPlan } from './IPCEvents/G14ControlPlans';
import { isNumber } from 'lodash';
import { writeConfig } from './IPCEvents/ConfigLoader';
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
		const fullPlan = {
			...dcPlan,
			ryzenadj: ryz,
			fanCurve: fan,
		} as FullG14ControlPlan;
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
		const fullPlan = {
			...acPlan,
			ryzenadj: ryz,
			fanCurve: fan,
		} as FullG14ControlPlan;
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
	if (
		!config.f5Switch ||
		!config.f5Switch.enabled ||
		!config.f5Switch.f5Plans
	) {
		return;
	}
	const plan_names: string[] = config.f5Switch.f5Plans;
	let plan_index = config.f5Switch.index;
	if (!isNumber(plan_index) || plan_index > plan_names.length) {
		plan_index = 0;
	} else {
		plan_index = plan_index + 1;
	}
	let new_plan_name: string = plan_names[plan_index % plan_names.length];
	let new_plan: G14ControlPlan = config.plans.find(
		(plan) => plan.name === new_plan_name
	);

	if (!new_plan || !new_plan_name) {
		LOGGER.error('Could not find next plan.');
		return;
	}

	if (!new_plan_name || !new_plan) {
		LOGGER.error(`Could not switch plans, no fitting plans found.`);
		return;
	}

	showNotification('Fn+F5', `Switching to: ${new_plan_name}`);

	g14Config.f5Switch.index = plan_index;
	writeConfig(g14Config);
	LOGGER.info(`F5 cycle power switching to ${new_plan_name}`);
	let ryz = new_plan.ryzenadj
		? config.ryzenadj.options.find((val) => val.name === new_plan.ryzenadj)
		: undefined;
	let fan = new_plan.fanCurve
		? config.fanCurves.find((val) => val.name === new_plan.fanCurve)
		: undefined;
	const fullPlan = {
		...new_plan,
		ryzenadj: ryz,
		fanCurve: fan,
	} as FullG14ControlPlan;
	let result = await setG14ControlPlan(fullPlan);
	if (!result) {
		LOGGER.error(`Could not switch plan.`);
		showNotification('Fn+F5', 'Error switching to: ' + new_plan.name);
	}
};

/** @format */

import { setG14ControlPlan } from './IPCEvents/G14ControlPlans';
import { whichCharger } from './IPCEvents/WMI/HardwareControl';
import { Notification } from 'electron';
import getLogger from './Logger';

const LOGGER = getLogger('StartupPlan');

const applyPlan = async (plano: G14ControlPlan, config: G14Config) => {
	let plan = plano;
	if (typeof plano === 'string') {
		plan = config.plans.find((pln) => pln.name === plano);
	} else {
		plan = plano;
	}

	LOGGER.info(`Recieved plan:\n${JSON.stringify(plan, null, 2)}`);
	let curve: FanCurveConfig;
	if (plan.fanCurve) {
		curve = config.fanCurves.find((curv) => {
			return curv.name === plan.fanCurve;
		}) as FanCurveConfig;
	}
	let radj: RyzenadjConfigNamed;
	if (plan.ryzenadj) {
		radj = config.ryzenadj.options.find((rdj) => {
			return rdj.name === plan.ryzenadj;
		});
	}

	if ((curve || !plan.fanCurve) && (radj || !plan.ryzenadj)) {
		let full: FullG14ControlPlan = {
			name: plan.name,
			fanCurve: curve,
			ryzenadj: radj,
			armouryCrate: plan.armouryCrate,
			boost: plan.boost,
			windowsPlan: plan.windowsPlan,
			graphics: plan.graphics,
		};
		let result = await setG14ControlPlan(full);
		if (result) {
			return true;
		} else {
			LOGGER.error('Failed to set G14Control plan.');
			return false;
		}
	} else {
		LOGGER.info(
			`Could not find curve or ryzenadj plan with names:\nryzen: ${plan.ryzenadj}\ncurve: ${plan.fanCurve}`
		);
		return false;
	}
};

export const initStartupPlan = async (config: G14Config) => {
	let { autoSwitch } = config;
	if (autoSwitch && autoSwitch.enabled) {
		let result = await whichCharger();
		if (result) {
			let { ac, dc, usb } = result;
			if ((ac || usb) && autoSwitch.acPlan) {
				let result = await applyPlan(autoSwitch.acPlan, config);
				if (result) {
					new Notification({
						title: 'Auto Switching',
						body: 'Switched to: ' + autoSwitch.acPlan.name,
					}).show();
				}
			} else if (dc && autoSwitch.dcPlan) {
				let result = await applyPlan(autoSwitch.dcPlan, config);
				if (result) {
					new Notification({
						title: 'Auto Switching',
						body: 'Switched to: ' + autoSwitch.dcPlan.name,
					}).show();
				}
			}
		}
	}
};

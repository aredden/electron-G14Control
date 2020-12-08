/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import { getConfig } from '../electron';
import getLogger from '../Logger';
import { modifyFanCurve } from './atrofac/ModifyFan';
import { modifyArmoryCratePlan } from './atrofac/SetArmoryPlan';
import { parseArrayCurve } from './AtrofacListeners';
import { setSwitchableDynamicGraphicsSettings } from './gpu/DiscreteGPU';
import {
	getActivePlan,
	getWindowsPlans,
	setBoost,
	setWindowsPlan,
} from './powercfg/Powercfg';
import { setRyzenadj } from './ryzenadj/ModifyCPU';

const LOGGER = getLogger('G14ControlPlans');

export const buildG14ControlPlanListeners = (
	win: BrowserWindow,
	ipc: IpcMain
) => {
	ipc.handle(
		'setG14ControlPlan',
		async (event, plano: G14ControlPlan | string) => {
			let config = getConfig();
			let plan: G14ControlPlan;
			if (typeof plano === 'string') {
				plan = config.plans.find((pln) => pln.name === plano);
			} else {
				plan = plano;
			}

			LOGGER.info(`Recieved plan:\n${JSON.stringify(plan, null, 2)}`);

			let curve = config.fanCurves.find((curv) => {
				return curv.name === plan.fanCurve;
			});
			let radj = config.ryzenadj.options.find((rdj) => {
				return rdj.name === plan.ryzenadj;
			});
			if (curve && radj) {
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
		}
	);
};

export const switchWindowsPlanToActivateSettings = async (
	activeGuid: string
) => {
	let allWindowsPlans = await getWindowsPlans();
	if (allWindowsPlans) {
		let otherPlan = allWindowsPlans.find((plan) => {
			return plan.guid !== activeGuid;
		});
		if (otherPlan) {
			LOGGER.info(`Found other plan: ${otherPlan.name}`);
			let other = await setWindowsPlan(otherPlan.guid);
			if (other) {
				LOGGER.info(`Switched to other plan: ${otherPlan.name}`);
				let back = await setWindowsPlan(activeGuid);
				if (back) {
					return true;
				} else {
					LOGGER.error(
						`There was an issue switching back from off plan to previous active plan.\nprevious: ${activeGuid}\noff: ${otherPlan.guid}`
					);
					return false;
				}
			} else {
				LOGGER.error(
					`There was an issue setting the active plan to off plan:\ncurrent: ${activeGuid}\noff: ${otherPlan.guid} `
				);
				return false;
			}
		} else {
			LOGGER.error('Could not find plan with matching GUID: ' + activeGuid);
			return false;
		}
	} else {
		LOGGER.error("Couldn't get all windows plans.");
		return false;
	}
};

/**
 * 1. Set Boost & Graphics at target windows plan since they are sensitive to changes.
 * 2. switch to target windows plan
 * 3. switch to target windows plan 
2. set  because they need to change and are sensitive
3. switch to new plan if different, or switch off and on if same
4. set ryzenadj
5. set fan curve
@param FullG14ControlPlan
@returns Boolean
*/
export const setG14ControlPlan = async (plan: FullG14ControlPlan) => {
	let { ryzenadj, fanCurve, boost, armouryCrate, graphics, windowsPlan } = plan;
	let boos = await setBoost(boost, windowsPlan.guid);

	let graphi = await setSwitchableDynamicGraphicsSettings(
		graphics,
		windowsPlan.guid
	);
	if (boos && graphi) {
		let active = await getActivePlan();
		if (active && active.guid === windowsPlan.guid) {
			let switched = await switchWindowsPlanToActivateSettings(
				windowsPlan.guid
			);
			if (!switched) {
				LOGGER.error(
					"Couldn't activate G14Control plan because couldn't shuffle windows plan to activate boost / graphics settings"
				);
				return false;
			}
		}
		let arm = await modifyArmoryCratePlan(armouryCrate);
		if (arm) {
			LOGGER.info('Succeffully modified armory crate plan to: ' + armouryCrate);
			let switchPlan = await setWindowsPlan(windowsPlan.guid);
			if (switchPlan) {
				LOGGER.info('Successfully switched windows plan to target plan.');
				let ryzn = await setRyzenadj(ryzenadj);
				if (!ryzn) {
					await setRyzenadj(ryzenadj);
				}
				let { cpu, gpu } = fanCurve;
				let gpuCurve = gpu ? parseArrayCurve(gpu) : undefined;
				let cpuCurve = cpu ? parseArrayCurve(cpu) : undefined;
				let result = await modifyFanCurve(cpuCurve, gpuCurve);
				if (result) {
					return true;
				} else {
					LOGGER.error('Failed to modify fan curve.');
					return false;
				}
			} else {
				LOGGER.error('Failed to switch windows plan to target plan.');
				return false;
			}
		} else {
			LOGGER.error('Failed to set Armoury Crate plan.');
			return false;
		}
	} else {
		LOGGER.error("Couldn't set boost & graphics preferences.");
		return false;
	}
};

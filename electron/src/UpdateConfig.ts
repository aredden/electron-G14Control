/** @format */

import hash from 'object-hash';
import { getConfig } from './electron';
import { writeConfig } from './IPCEvents/ConfigLoader';
import getLogger from './Logger';

const LOGGER = getLogger('NewUpdateConfig');

const updateHashOfG14Plans = (config: G14Config) => {
	let needsUpdate = false;
	config.plans.forEach((plan, idx) => {
		if (!plan.guid) {
			config.plans[idx].guid = hash.MD5(JSON.stringify(plan));
			needsUpdate = true;
		}
	});
	const plans = config.plans;
	if (needsUpdate && config.f5Switch && config.f5Switch.f5Plans) {
		config.f5Switch.f5Plans = config.f5Switch.f5Plans.map((plan) => {
			const planFromName = plans.find((fulplan) => fulplan.name === plan);
			const planFromGuid = plans.find((fulplan) => fulplan.guid === plan);
			if (planFromName) {
				return planFromName.guid;
			} else if (planFromGuid) {
				return planFromGuid.guid;
			} else {
				LOGGER.error('Could not find valid plan from name or guid: ' + plan);
				throw Error('Could not update plans for new update.');
			}
		});
	}
	return { config, needsUpdate };
};

const updateConfigOnUpdate = async (config?: G14Config) => {
	let conf = config ? config : (getConfig() as G14Config);
	const { config: c0, needsUpdate } = updateHashOfG14Plans(conf);
	if (needsUpdate) {
		return new Promise<boolean>(async (resolve) => {
			await writeConfig(c0);
			resolve(true);
		});
	} else {
		return false;
	}
};

export default updateConfigOnUpdate;

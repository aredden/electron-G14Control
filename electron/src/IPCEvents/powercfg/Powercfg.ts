/** @format */

import { exec } from 'child_process';
import getLogger from '../../Logger';
import { parsePlans } from '../../Utilities';
import { switchWindowsPlanToActivateSettings } from '../G14ControlPlans';
import path from 'path';
import is_dev from 'electron-is-dev';
import { app } from 'electron';
import Shell from 'node-powershell';
import { isBoolean } from 'lodash';
require('dotenv').config();
const LOGGER = getLogger('Powercfg');

const PWRPROF_HELPER = is_dev
	? process.env.PWRPROF_HELPER
	: path
			.join(
				app.getPath('exe'),
				'../',
				'resources',
				'extraResources',
				'G14PowerCfg.exe'
			)
			.replace(' ', '` ');

export const getActivePlan = async (): Promise<
	{ name: string; guid: string } | false
> => {
	return new Promise((resolve) =>
		exec('powercfg /getactivescheme', (err, out, stderr) => {
			if (!err && !stderr) {
				let parsed = parsePlans(out);
				if (parsed.length === 1) {
					resolve(parsed[0]);
				} else {
					LOGGER.info("Couldn't parse active plan. " + parsed);
				}
			} else {
				LOGGER.error(
					`Error getting active windows plan guid's from powercfg...\n${JSON.stringify(
						{ err, stderr },
						null,
						2
					)}`
				);
				resolve(false);
			}
		})
	);
};

export const getWindowsPlans = async (): Promise<
	Array<{ name: string; guid: string }> | false
> => {
	return new Promise((resolve) => {
		exec('powercfg /l', (err, out, stderr) => {
			if (!err && !stderr) {
				resolve(parsePlans(out));
			} else {
				LOGGER.error(
					`Error getting all windows plan guid's from powercfg...\n${JSON.stringify(
						{ err, stderr },
						null,
						2
					)}`
				);
				resolve(false);
			}
		});
	});
};

export const setWindowsPlan = async (guid: string): Promise<boolean> => {
	return new Promise((resolve) => {
		exec(`powercfg /setactive ${guid}`, (err, out, stderr) => {
			if (!err && !stderr) {
				LOGGER.info('Switched to plan: ' + guid);
				resolve(true);
			} else {
				LOGGER.error(
					`Error setting windows plan to guid ${guid}...\n${JSON.stringify(
						{ err, stderr },
						null,
						2
					)}`
				);
				resolve(false);
			}
		});
	});
};

export const getCPUBoostRawResult = async (
	guid?: string
): Promise<string | false> => {
	let activeGuid: string = guid as string;
	if (!guid) {
		let plan = await getActivePlan();
		if (!plan) {
			LOGGER.error(
				'getCPUBoostRawResult active plan GUID could not be parsed.'
			);
			return false;
		}
		activeGuid = (plan as { name: string; guid: string }).guid;
	}
	if (activeGuid) {
		return new Promise((resolve) => {
			exec(
				`powercfg /q ${activeGuid} SUB_PROCESSOR PERFBOOSTMODE`,
				(err, out, stderr) => {
					if (!err && !stderr) {
						resolve(out);
					} else {
						LOGGER.error(
							`Error getting boost for guid: ${activeGuid}:\n${JSON.stringify(
								{ err, stderr },
								null,
								2
							)}`
						);
						resolve(false);
					}
				}
			);
		});
	} else {
		LOGGER.info('getCPUBoostRawResult active plan GUID could not be parsed.');
		return false;
	}
};

export const setBoost = async (
	value: string | number,
	guid?: string,
	doSwitch = true
) => {
	let activeGuid: string = guid as string;
	if (!guid) {
		let plan = await getActivePlan();
		if (!plan) {
			LOGGER.info('getCPUBoostRawResult active plan GUID could not be parsed.');
			return false;
		}
		activeGuid = (plan as { name: string; guid: string }).guid;
	}
	let ac = new Promise<boolean>((resolve) => {
		exec(
			`powercfg /setacvalueindex ${activeGuid} SUB_PROCESSOR PERFBOOSTMODE ${value.toString()}`,
			(err, out, stderr) => {
				if (err || stderr) {
					LOGGER.error(
						`Problem setting boost ac power index for guid: ${activeGuid} and boost ${value}. Error:\n${JSON.stringify(
							{ err, stderr }
						)}`
					);
					resolve(false);
				} else {
					LOGGER.info('Successfully set AC boost to: ' + value);
					resolve(true);
				}
			}
		);
	});
	let dc = new Promise<boolean>((resolve) => {
		exec(
			`powercfg /setdcvalueindex ${activeGuid} SUB_PROCESSOR PERFBOOSTMODE ${value.toString()}`,
			(err, out, stderr) => {
				if (err || stderr) {
					LOGGER.error(
						`Problem setting boost dc power index for guid: ${activeGuid} and boost ${value}. Error:\n${JSON.stringify(
							{ err, stderr }
						)}`
					);
					resolve(false);
				} else {
					LOGGER.info('Successfully set DC boost to: ' + value);
					resolve(true);
				}
			}
		);
	});
	let result = await Promise.all([ac, dc]);
	let resultSuccess = true;
	result.forEach((x) => {
		if (!x) {
			resultSuccess = false;
		}
	});
	let current = await getActivePlan();
	if (
		current &&
		(!guid || guid === current.guid) &&
		resultSuccess &&
		doSwitch
	) {
		LOGGER.info('Need to switch windows plan to activate boost.');
		let hok = await switchWindowsPlanToActivateSettings(current.guid);
		return hok;
	} else {
		return resultSuccess;
	}
};

export const getBoostFromHelper = async (guid?: string) => {
	const sh = new Shell({
		noProfile: true,
		executionPolicy: 'Bypass',
	});
	guid
		? sh.addCommand(`${PWRPROF_HELPER} boostget ${guid}`)
		: sh.addCommand(`${PWRPROF_HELPER} boostget active`);

	const result = await sh.invoke().catch((err) => {
		if (err) {
			LOGGER.info('Error: ' + err);
		}
	});
	const vals = result ? result.split(' ') : [];
	LOGGER.info(result + `  ${PWRPROF_HELPER} boostget ${guid}`);
	sh.dispose();
	if (vals.length === 2) {
		LOGGER.info(`length ${vals[0].length} ${vals[1].trim().length}`);
		return {
			ac: vals[0].trim(),
			dc: vals[1].trim(),
		};
	} else {
		return false;
	}
};

export const getGraphicsFromHelper = async (guid?: string) => {
	const sh = new Shell({
		noProfile: true,
		executionPolicy: 'Bypass',
	});
	guid
		? sh.addCommand(`${PWRPROF_HELPER} graphicsget ${guid}`)
		: sh.addCommand(`${PWRPROF_HELPER} graphicsget active`);
	const result = await sh.invoke().catch((err) => {
		if (err) {
			LOGGER.info('Error: ' + err);
		}
	});
	const vals = result ? result.split(' ') : [];
	sh.dispose();
	if (vals.length === 2) {
		LOGGER.info(vals.toString());
		return {
			ac: vals[0].trim(),
			dc: vals[1].trim(),
		};
	}
};

export const setGraphicsFromHelper = async (
	value: string | number,
	guid?: string,
	doswitch = true
) => {
	const sh = new Shell({
		noProfile: true,
		executionPolicy: 'Bypass',
	});
	guid
		? sh.addCommand(`${PWRPROF_HELPER} graphicsset ${guid} ${value}`.toString())
		: sh.addCommand(`${PWRPROF_HELPER} graphicsset active ${value}`.toString());

	const result = await sh.invoke().catch((err) => {
		if (err) {
			LOGGER.info('Error: ' + err);
		}
	});
	sh.dispose();
	if (result && result.trim() === 'True') {
		const active = await getActivePlan();

		if (!isBoolean(active) && doswitch) {
			const ok = await switchWindowsPlanToActivateSettings(active.guid);
			if (ok) {
				LOGGER.info('Set graphics');
				return true;
			} else {
				LOGGER.error(
					'Failed to switch windows plan, but successfully set graphics'
				);
				return false;
			}
		}
		if (active && !doswitch) {
			LOGGER.info('Set graphics');
			return true;
		}
	} else {
		LOGGER.error('Failed to set graphics');
		return false;
	}
};

export const setBoostFromHelper = async (
	value: string | number,
	guid?: string,
	doswitch = true
) => {
	const sh = new Shell({
		noProfile: true,
		executionPolicy: 'Bypass',
	});
	guid
		? sh.addCommand(`${PWRPROF_HELPER} boostset ${guid} ${value}`.toString())
		: sh.addCommand(`${PWRPROF_HELPER} boostset active ${value}`.toString());

	const result = await sh.invoke().catch((err) => {
		if (err) {
			LOGGER.info('Error: ' + err);
		}
	});
	sh.dispose();
	if (result && result.trim() === 'True') {
		const active = await getActivePlan();

		if (!isBoolean(active) && doswitch) {
			const ok = await switchWindowsPlanToActivateSettings(active.guid);
			if (ok) {
				LOGGER.info('Set boost');
				return true;
			} else {
				LOGGER.error(
					'Failed to switch windows plan, but successfully set boost'
				);
				return false;
			}
		}
		if (active && !doswitch) {
			LOGGER.info('Set boost');
			return true;
		}
	} else {
		LOGGER.error('Failed to set boost');
		return false;
	}
};

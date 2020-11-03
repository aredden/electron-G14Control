/** @format */

import { exec } from 'child_process';
import getLogger from '../../Logger';
import { parsePlans } from '../../Utilities';

const LOGGER = getLogger('Powercfg');

export const getActivePlan = async (): Promise<
	{ name: string; guid: string } | false
> => {
	return new Promise((resolve) =>
		exec('powercfg /getactivescheme', (err, out, stderr) => {
			if (!err && !stderr) {
				let parsed = parsePlans(out);
				if (parsed.length === 1) {
					resolve(parsed[0]);
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
	let activeGuid: string = guid;
	if (!guid) {
		let plan = await getActivePlan();
		if (!plan) {
			LOGGER.info('getCPUBoostRawResult active plan GUID could not be parsed.');
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

export const setBoost = async (value: string | number, guid?: string) => {
	let activeGuid: string = guid;
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
	return resultSuccess;
};

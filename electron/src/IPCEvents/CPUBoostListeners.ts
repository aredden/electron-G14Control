/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import getLogger from '../Logger';
import { getCPUBoostRawResult, setBoost } from './powercfg/Powercfg';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = getLogger('WindowsPlanListeners');

const parseBoost = (rawBoost: string) => {
	let acBoostRegex = new RegExp(
		/Current AC Power Setting Index: 0x0000000[024]/,
		'gm'
	);
	let dcBoostRegex = new RegExp(
		/Current DC Power Setting Index: 0x0000000[024]/,
		'gm'
	);
	let acboost = acBoostRegex.exec(rawBoost);
	let dcboost = dcBoostRegex.exec(rawBoost);

	//check that parsed single line boost strings exist~~
	if (
		acboost.length > 0 &&
		acboost[0].length > 0 &&
		dcboost.length > 0 &&
		dcboost[0].length > 0
	) {
		let acBoostValue = acboost[0][acboost[0].length - 1];
		let dcBoostValue = dcboost[0][dcboost[0].length - 1];
		return { ac: acBoostValue, dc: dcBoostValue };
	} else {
		LOGGER.error(
			`Parsed single line boost regex values were not found.\n${JSON.stringify({
				acboost,
				dcboost,
			})}`
		);
		return false;
	}
};

export const buildCPUBoostListeners = (ipc: IpcMain, win: BrowserWindow) => {
	ipc.handle('getBoost', async (e, guid: string) => {
		let boostRaw: string | false = await getCPUBoostRawResult(guid);
		if (!boostRaw) {
			return false;
		} else {
			return {
				guid: guid,
				boost: parseBoost(boostRaw),
			};
		}
	});
	ipc.handle(
		'setBoost',
		async (e, boostLevel: string | number, guid?: string) => {
			let boost =
				typeof boostLevel === 'string'
					? parseInt(boostLevel as string)
					: (boostLevel as number);
			let result = await setBoost(boost, guid);
			return { guid: guid, result: result };
		}
	);
};

/** @format */
import Shell from 'node-powershell';
import createLogger from '../../Logger';
import is_dev from 'electron-is-dev';
import { app } from 'electron';
import path from 'path';
import { getActivePlan } from '../powercfg/Powercfg';

const LOGGER = createLogger('GPUScripts');

const SW_DYNAMC_GRAPHICS = 'e276e160-7cb0-43c6-b20b-73f5dce39954';
const GLOBAL_SETTINGS = 'a1662ab2-9d34-4e53-ba8b-2639b9e20857';
const AC = '/setacvalueindex';
const DC = '/setdcvalueindex';

let restartGPULoc = is_dev
	? process.env.RESTART_GPU_LOC
	: path.join(
			app.getPath('exe'),
			'../',
			'resources',
			'extraResources',
			'RestartGPU.exe'
	  );

export const resetGPU = async () => {
	const ps = new Shell({
		executionPolicy: 'Bypass',
		noProfile: true,
	});
	return new Promise((resolve) => {
		ps.addCommand(`& "${restartGPULoc}" cli`);
		ps.invoke()
			.then((result) => {
				ps.dispose();
				LOGGER.info('Result resetting GPU:\n' + result);
				resolve(true);
			})
			.catch((err) => {
				ps.dispose();
				resolve(false);
				LOGGER.error(
					'Error recieved after running command:\n' + err.toString()
				);
			});
	});
};

const parseCurrentDynamicGraphicsValues = (answer: string) => {
	let returnValues = { ac: undefined, dc: undefined };
	let graphicsACSettingSub = answer.match(
		/Current AC Power Setting Index: 0x0000000[0-9]{1}/gm
	);
	let graphicsDCSettingSub = answer.match(
		/Current DC Power Setting Index: 0x0000000[0-9]{1}/gm
	);
	if (graphicsACSettingSub && graphicsACSettingSub.length === 1) {
		graphicsACSettingSub.forEach((value) => {
			let acValue = value.replace(
				/Current AC Power Setting Index: 0x0000000/,
				''
			);
			if (acValue && acValue.length === 1) {
				returnValues.ac = parseInt(acValue);
			}
		});
	}
	if (graphicsDCSettingSub && graphicsDCSettingSub.length === 1) {
		graphicsDCSettingSub.forEach((value) => {
			let dcValue = value.replace(
				/Current DC Power Setting Index: 0x0000000/,
				''
			);
			if (dcValue && dcValue.length === 1) {
				returnValues.dc = parseInt(dcValue);
			}
		});
	}
	return returnValues;
};

export const getSwitchableDynamicGraphicsSettings = async () => {
	const ps = new Shell({
		executionPolicy: 'Bypass',
		noProfile: true,
	});
	return new Promise(async (resolve) => {
		let result = await getActivePlan();
		if (result) {
			ps.addCommand(
				`powercfg /q ${result.guid} ${SW_DYNAMC_GRAPHICS} ${GLOBAL_SETTINGS}`
			);
			ps.invoke()
				.then((answer) => {
					ps.dispose();
					let ACDCValues = parseCurrentDynamicGraphicsValues(answer);
					resolve({ plan: result, result: ACDCValues });
				})
				.catch((err) => {
					ps.dispose();
					LOGGER.error(err);
					resolve(false);
				});
		} else {
			LOGGER.error("Couldn't find active Windows plan.");
			resolve(false);
		}
	});
};

export const setSwitchableDynamicGraphicsSettings = async (
	setting: number,
	guid?: string
) => {
	const ps = new Shell({
		executionPolicy: 'Bypass',
		noProfile: true,
	});
	return new Promise(async (resolve) => {
		let result: { name: string; guid: string } | false;
		if (guid) {
			result = { name: '', guid: guid };
		} else {
			result = await getActivePlan();
		}
		if (result) {
			ps.addCommand(
				`powercfg ${AC} ${result.guid} ${SW_DYNAMC_GRAPHICS} ${GLOBAL_SETTINGS} ${setting}`
			);
			ps.invoke()
				.then((value) => {
					LOGGER.info(value);
					//@ts-ignore
					ps.addCommand(
						//@ts-ignore
						`powercfg ${DC} ${result.guid} ${SW_DYNAMC_GRAPHICS} ${GLOBAL_SETTINGS} ${setting}`
					);
					ps.invoke()
						.then((result) => {
							ps.dispose();
							resolve(true);
						})
						.catch((err) => {
							ps.dispose();
							LOGGER.info(
								`Error setting AC value for switchable dynamic graphics...\n${err}`
							);
							resolve(false);
						});
				})
				.catch((err) => {
					ps.dispose();
					LOGGER.info(
						`Error setting AC value for switchable dynamic graphics...\n${err}`
					);
					resolve(false);
				});
		} else {
			ps.dispose();
			LOGGER.error(`Trouble getting active plan from powercfg.`);
			resolve(false);
		}

		// if(result){
		// 	result.guid
		// }
		// ps.addCommand(`powercfg /q ${}`)
	});
};

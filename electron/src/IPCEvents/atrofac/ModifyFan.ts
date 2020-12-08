/** @format */

import { exec } from 'child_process';
import getLogger from '../../Logger';
import dotenv from 'dotenv';
import is_dev from 'electron-is-dev';
import path from 'path';
import { app } from 'electron';
dotenv.config();

const ATRO_LOC = is_dev
	? (process.env.ATRO_LOC as string)
	: path.join(
			app.getPath('exe'),
			'../',
			'resources',
			'extraResources',
			'atrofac-cli.exe'
	  );

const LOGGER = getLogger('ModifyFans');

const testCurveValidity = (curve: string): boolean => {
	let reg = new RegExp(/[1]?[0-9]{1}0c:[1]?[0-9]{1,2}%,?/, 'gm');
	let matches = Array.from(curve.match(reg));
	if (matches && matches.length === 8) {
		return true;
	}
	return false;
};

const allowedPlans = ['windows', 'silent', 'performance', 'turbo'];

const buildCommand = (cpu?: string, gpu?: string, plan?: string) => {
	let cmd = `fan`;
	if (cpu && testCurveValidity(cpu)) {
		cmd += ` --cpu ${cpu}`;
	}
	if (gpu && testCurveValidity(gpu)) {
		cmd += ` --gpu ${gpu}`;
	}
	if (plan && allowedPlans.includes(plan)) {
		cmd += ` plan ${plan}`;
	}
	return cmd;
};

export const modifyFanCurve = async (
	cpuCurve?: string,
	gpuCurve?: string,
	plan?: string
) => {
	const command = buildCommand(cpuCurve, gpuCurve, plan);

	if (plan || cpuCurve || gpuCurve) {
		return new Promise<{ cpuCurve: string; gpuCurve: string } | false>(
			(resolve, reject) => {
				exec(`cmd /C "${ATRO_LOC}" ${command}`, (err, out, stderr) => {
					if (err || stderr) {
						if (stderr.indexOf('Success') !== -1) {
							//@ts-ignore
							LOGGER.info(
								`Result of atrofac fan curve: \ncpu: ${cpuCurve}\n gpu: ${gpuCurve}:\n result:${stderr}`
							);
							//@ts-ignore
							resolve({ cpuCurve, gpuCurve });
						} else {
							LOGGER.error(
								`Error setting atrofac fan curve: ${JSON.stringify({
									err,
									stderr,
									cpuCurve,
								})}`
							);
							resolve(false);
						}
					} else {
						LOGGER.info(
							`Result of atrofac fan curve: \ncpu: ${cpuCurve}\n gpu: ${gpuCurve}:\n result:${out}`
						);
						//@ts-ignore
						resolve({ cpuCurve, gpuCurve });
					}
				});
			}
		);
	} else {
		LOGGER.error(
			`Fan curves: ${JSON.stringify({
				cpuCurve,
				gpuCurve,
			})} did not pass validity check.`
		);
		return false;
	}
};

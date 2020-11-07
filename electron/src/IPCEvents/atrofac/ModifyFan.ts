/** @format */

import { exec } from 'child_process';
import getLogger from '../../Logger';
import dotenv from 'dotenv';
dotenv.config();
const ATRO_LOC = process.env.ATRO_LOC;

const LOGGER = getLogger('ModifyFans');

const testCurveValidity = (curve: string): boolean => {
	let reg = new RegExp(/[1]?[0-9]{1}0c:[1]?[0-9]{1,2}%,?/, 'gm');
	let matches = Array.from(curve.matchAll(reg));
	LOGGER.info(JSON.stringify(matches));
	if (matches && matches.length === 8) {
		return true;
	}
	return false;
};

export const modifyFanCurve = async (cpuCurve: string, gpuCurve: string) => {
	if (testCurveValidity(cpuCurve) && testCurveValidity(gpuCurve)) {
		return new Promise<{ cpuCurve: string; gpuCurve: string } | false>(
			(resolve, reject) => {
				exec(
					`${ATRO_LOC} fan --cpu ${cpuCurve} --gpu ${gpuCurve} --plan turbo`,
					(err, out, stderr) => {
						if (err || stderr) {
							if (stderr.indexOf('Success') !== -1) {
								resolve({ cpuCurve, gpuCurve });
								LOGGER.info(
									`Result of atrofac fan curve ${cpuCurve} ${gpuCurve}:\n${JSON.stringify(
										stderr
									)}`
								);
								resolve({ cpuCurve, gpuCurve });
							} else {
								LOGGER.info(
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
								`Result of atrofac fan curve ${cpuCurve}:\n${JSON.stringify(
									out
								)}`
							);
							resolve({ cpuCurve, gpuCurve });
						}
					}
				);
			}
		);
	} else {
		LOGGER.info(
			`Fan curves: ${JSON.stringify({
				cpuCurve,
				gpuCurve,
			})} did not pass validity check.`
		);
		return false;
	}
};

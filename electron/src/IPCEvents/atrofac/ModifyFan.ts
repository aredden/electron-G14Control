/** @format */

import { exec } from 'child_process';
import getLogger from '../../Logger';
import dotenv from 'dotenv';
dotenv.config();
const ATRO_LOC = process.env.ATRO_LOC;

const LOGGER = getLogger('ModifyFans');

const testCurveValidity = (curve: string): boolean => {
	let reg = new RegExp(/[1]?[0-9]{1}0c:[0-9]{1,2}%,?/, 'g');
	let compiled = reg.exec(curve);
	if (compiled && compiled.length === 8) {
		return true;
	}
	return false;
};

export const modifyFanCurve = async (cpuCurve: string, gpuCurve: string) => {
	if (testCurveValidity(cpuCurve) && testCurveValidity(gpuCurve)) {
		return new Promise<string | false>((resolve, reject) => {
			exec(
				`${ATRO_LOC} fan --cpu ${cpuCurve} --gpu ${gpuCurve}`,
				(err, out, stderr) => {
					if (err || stderr) {
						LOGGER.info(
							`Error setting atrofac fan curve: ${JSON.stringify({
								err,
								stderr,
								cpuCurve,
							})}`
						);
						resolve(false);
					} else {
						LOGGER.info(
							`Result of atrofac fan curve ${cpuCurve}:\n${JSON.stringify(out)}`
						);
						resolve(cpuCurve);
					}
				}
			);
		});
	} else {
		return false;
	}
};

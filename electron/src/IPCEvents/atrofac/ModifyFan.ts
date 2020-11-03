/** @format */

import { exec } from 'child_process';
import getLogger from '../../Logger';

const ATRO_LOC = process.env.ATRO_LOC;

const LOGGER = getLogger('ModifyFans');

const testCurveValidity = (curve: string): boolean => {
	let reg = new RegExp(/[1]?[0-9]{1}0c:[0-9]{1,2}%,?/, 'g');
	let compiled = reg.exec(curve);
	if (compiled.length === 8) {
		return true;
	}
	return false;
};

export const modifyFanCurve = async (curve: string) => {
	if (testCurveValidity(curve)) {
		return new Promise((resolve, reject) => {
			exec(`${ATRO_LOC} `, (err, out, stderr) => {
				if (err || stderr) {
					LOGGER.info(
						`Error setting atrofac fan curve: ${JSON.stringify({
							err,
							stderr,
							curve,
						})}`
					);
					resolve(false);
				} else {
					LOGGER.info(
						`Result of atrofac fan curve ${curve}:\n${JSON.stringify(out)}`
					);
					resolve(curve);
				}
			});
		});
	}
};

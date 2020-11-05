/** @format */

import { exec } from 'child_process';
import getLogger from '../../Logger';
import dotenv from 'dotenv';
dotenv.config();
const ATRO_LOC = process.env.ATRO_LOC;

const LOGGER = getLogger('SetArmoryPlan');

export const modifyArmoryCratePlan = async (plan: ArmoryPlan) => {
	return new Promise<ArmoryPlan | false>((resolve, reject) => {
		exec(`${ATRO_LOC} --plan ${plan}`, (err, out, stderr) => {
			if (err || stderr) {
				LOGGER.info(
					`Error setting atrofac armory crate plan: ${JSON.stringify({
						err,
						stderr,
					})}`
				);
				resolve(false);
			} else {
				LOGGER.info(
					`Result of atrofac armory crate plan:\n${JSON.stringify(out)}`
				);
				resolve(plan);
			}
		});
	});
};

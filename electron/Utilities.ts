/** @format */

import chalk from 'chalk';
import getLogger from './Logger';

const LOGGER = getLogger('Utilities');

export const parsePlans = (plans: string) => {
	const r = new RegExp(/([0-9a-f-]{36}) *\((.*)\) *?\n*/, 'gm');
	const regexpResult = [...plans.matchAll(r)];
	const result = regexpResult.map((val) => {
		return {
			name: val[2],
			guid: val[1],
		};
	});
	LOGGER.info(
		`Attained result of ${chalk.green(`parsePlans()`)}:\n ${JSON.stringify(
			result,
			null,
			2
		)}`
	);
	return result;
};

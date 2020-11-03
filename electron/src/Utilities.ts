/** @format */

import getLogger from './Logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
	return result;
};

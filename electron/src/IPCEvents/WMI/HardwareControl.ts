/** @format */

import Shell from 'node-powershell';
import getLogger from '../../Logger';

const LOGGER = getLogger('HardwareControl');

const ps = new Shell({
	noProfile: true,
	executionPolicy: 'bypass',
	inputEncoding: 'utf-8',
	outputEncoding: 'utf-8',
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BATTERY_AC_USBC = '0x0012006C';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BATTERY_AC = '0x00120061';

const parseWmiObjectResult = (res: string) => {
	//@ts-ignore
	let matches = res.match(/device_status *: *(0x){0,1}[a-zA-Z0-9]{1,10}/gm);
	if (matches && matches.length === 1) {
		let preresult = matches[0].split(':')[1];
		let result = preresult.match(/(0x){0,1}[a-fA-F0-9]{1,10}/gm);
		if (result && result.length === 1) {
			return result[0];
		} else {
			return false;
		}
	} else {
		LOGGER.error(`Could not match from:\n${res}\nGot result: ${matches}`);
		return false;
	}
};

export const buildAtkWmi = (area: string, address: string, key?: number) => {
	return `"(Get-WmiObject -Namespace root/WMI -Class AsusAtkWmi_WMNB).${area}(${address}${
		key ? ` ,${key}` : ''
	})"`;
};

export const isPluggedIn = async () => {
	let command = buildAtkWmi('DSDT', '0x00120061');
	ps.addCommand(command);
	let result = parseWmiObjectResult(await ps.invoke());
	if (result) {
		switch (result) {
			case '65537':
				return true;
			case '65536':
				return false;
		}
		LOGGER.info(`Charger state: ${result}`);
	}
};

export const whichCharger = async () => {
	let command = buildAtkWmi('DSDT', BATTERY_AC_USBC);
	ps.addCommand(command);

	let whichcharger = await ps.invoke();
	LOGGER.info(whichcharger);
	return { ac: true, usbc: false };
};

export const setBatteryLimiter = async (amount: number) => {
	return true;
};

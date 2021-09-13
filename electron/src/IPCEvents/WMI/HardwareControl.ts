/** @format */

import Shell from 'node-powershell';
import getLogger from '../../Logger';

const LOGGER = getLogger('HardwareControl');

export const BATTERY_AC_USBC = '0x0012006C';
export const BATTERY_AC = '0x00120061';

const parseWmiObjectResult = (res: string, targetProperty?: string) => {
	//@ts-ignore
	let matcher = targetProperty
		? new RegExp(`${targetProperty} *: *(0x){0,1}[a-zA-Z0-9]{1,10}`, 'gm')
		: /device_status *: *(0x){0,1}[a-zA-Z0-9]{1,10}/gm;
	let matches = res.match(matcher);
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
	return `(Get-WmiObject -Namespace root/WMI -Class AsusAtkWmi_WMNB).${area}(${address}${
		key ? ` ,${key}` : ''
	})`;
};

export const isPluggedIn = async () => {
	const ps = new Shell({
		noProfile: true,
		executionPolicy: 'bypass',
		inputEncoding: 'utf-8',
		outputEncoding: 'utf-8',
	});
	let command = buildAtkWmi('DSTS', '0x00120061');
	ps.addCommand(command);
	let result = parseWmiObjectResult(await ps.invoke());
	if (result) {
		ps.dispose();
		switch (result) {
			case '65537':
				return true;
			case '65536':
				return false;
		}
		LOGGER.info(`Charger state: ${result}`);
	}
};

//    USB-C PD:       0x00010002 (65538)
//    180W:           0x00010001 (65537)
//    No:             0x00000000
export const whichCharger = async () => {
	const ps = new Shell({
		noProfile: true,
		executionPolicy: 'bypass',
		inputEncoding: 'utf-8',
		outputEncoding: 'utf-8',
	});
	let command = buildAtkWmi('DSTS', BATTERY_AC_USBC);
	ps.addCommand(command);
	return new Promise<false | { ac: boolean; dc: boolean; usb: boolean }>(
		(resolve) => {
			ps.invoke()
				.then((resulted) => {
					ps.dispose();
					let parsed = parseWmiObjectResult(resulted);
					LOGGER.info('Which Charger Result: ' + parsed);
					if (parsed) {
						switch (parsed) {
							case '0': {
								resolve({ ac: false, dc: true, usb: false });
								break;
							}
							case '65538': {
								resolve({ ac: false, dc: false, usb: true });
								break;
							}
							case '65537': {
								resolve({ ac: true, dc: false, usb: true });
								break;
							}
						}
					} else {
						resolve(false);
					}
				})
				.catch((err) => {
					ps.dispose();
					LOGGER.info('Error result from check which charger: \n' + err);
					resolve(false);
				});
		}
	);
};

// (Get-WmiObject -Namespace root/WMI -Class AsusAtkWmi_WMNB).DEVS(0x00120057, X)
export const setBatteryLimiter = async (amount: number) => {
	const ps = new Shell({
		noProfile: true,
		executionPolicy: 'bypass',
		inputEncoding: 'utf-8',
		outputEncoding: 'utf-8',
	});
	if (amount <= 100 && amount > 20) {
		let command = buildAtkWmi('DEVS', '0x00120057', amount);
		ps.addCommand(command);
		return new Promise((resolve) => {
			ps.invoke()
				.then((result) => {
					ps.dispose();
					let resultValue = parseWmiObjectResult(result, 'result');
					if (resultValue === '1') {
						resolve(true);
					} else {
						LOGGER.info(
							`Setting battery limit resulted in unexpected result: \n${JSON.stringify(
								result
							)}`
						);
						resolve(false);
					}
				})
				.catch((err) => {
					ps.dispose();
					LOGGER.info(
						`Setting battery limit resulted in error: \n${JSON.stringify(err)}`
					);
					return false;
				});
		});
	}
	return false;
};

export const removeBatteryLimiter = async () => {
	return new Promise((resolve) => {
		// TODO: maybe remove listener and do call 'removeLimit' directly? (then we can know if task successfully completed)
		resolve(true);
	});
};

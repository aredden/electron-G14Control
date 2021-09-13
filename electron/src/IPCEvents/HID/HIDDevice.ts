/** @format */

import * as hid from 'node-hid';
import Shell from 'node-powershell';
import getLogger from '../../Logger';
import {
	ARMCRATE_INTERFACE,
	ARMCRATE_KEY_CTRL,
	ARMCRATE_MANAGER,
	ARMCRATE_MANAGER_AGENT,
	ARMCRATE_SESS_HELPER,
	ARMCRATE_SVC,
	ARMCRATE_SVC_PATH,
	ARMORY_SW_AGENT,
	ARMORY_SW_AGENT_PATH,
	ARMSOCK_SERV,
	ARMSOCK_SERV_PATH,
	ASUSACCI_PATH,
	ASUS_VENDOR_ID,
	G14_2020,
	G14_2021,
} from './constants';

const LOGGER = getLogger('HIDControl');

const makeShell = () => {
	return new Shell({
		executionPolicy: 'Bypass',
		noProfile: true,
	});
};

const formatNameIsRunning = (name: string) => {
	return `${name} is running`;
};

const formatNameIsNotRunning = (name: string) => {
	return `${name} is not running`;
};

const getProcessWhereName = (name: string) =>
	`Get-Process | Where-Object Name -like "${name.replace(
		'.exe',
		''
	)}" | Select-Object ProcessName`;

export const checkExecutableAtPathExists = (name: string, path: string) => {
	return new Promise((resolve) => {
		let ps = new Shell({
			executionPolicy: 'Bypass',
			noProfile: true,
		});
		ps.addCommand(`Test-Path "${path}/${name}" -PathType Leaf`);
		ps.invoke()
			.then((result) => {
				ps.dispose();
				if (result.indexOf('False') !== -1) {
					LOGGER.info(`Did not find file ${name} at path: "${path}"`);
					resolve(false);
				} else {
					LOGGER.info(`Found file ${name} at path: "${path}"`);
					resolve(true);
				}
			})
			.catch((err) => {
				ps.dispose();
				LOGGER.info('Error checking path exists: ' + err);
				resolve(false);
			});
	});
};

export const checkRemoveAndRename = (name: string, path?: string) => {
	return new Promise((resolve) => {
		if (path) {
			checkExecutableAtPathExists(name, path).then((ok) => {
				if (ok) {
					renameProcess(name, name + '_disabled', path).then(() => {
						checkProcessExist(name).then((result) => {
							if (result) {
								killProcess(name).then(() => {
									resolve(true);
								});
							} else {
								resolve(true);
							}
						});
					});
				} else {
					LOGGER.info(
						`${name} at "${path}" has already been renamed to name.exe_disabled or does not exist.`
					);
					checkProcessExist(name).then((result) => {
						if (result) {
							killProcess(name).then(() => {
								resolve(true);
							});
						} else {
							resolve(true);
						}
					});
				}
			});
		} else {
			checkProcessExist(name).then((result) => {
				if (result) {
					killProcess(name).then(() => {
						resolve(true);
					});
				} else {
					resolve(true);
				}
			});
		}
	});
};

export const checkProcessExists = async (name: string) => {
	const ps = makeShell();
	try {
		ps.addCommand(getProcessWhereName(name));
		const result = await ps.invoke();
		if (result && result.length > 0) {
			LOGGER.info(formatNameIsRunning(name));
			return true;
		} else {
			LOGGER.info(formatNameIsNotRunning(name));
			return false;
		}
	} catch (err) {
		LOGGER.error(`Error checking process named: ${name}...\nError: \n${err}`);
		ps.dispose();
		return false;
	}
};

export const checkProcessExist = async (executableName: string) => {
	return new Promise((resolve) => {
		let ps = new Shell({
			executionPolicy: 'Bypass',
			noProfile: true,
		});
		ps.addCommand(
			`Get-Process | Where-Object Name -like "${executableName.replace(
				'.exe',
				''
			)}" | Select-Object ProcessName`
		);
		ps.invoke()
			.then((result) => {
				ps.dispose();
				if (result.length > 0) {
					LOGGER.info(
						`Result of checkProcessExists(): Process ${executableName} is running!`
					);
					resolve(true);
				} else {
					LOGGER.info(
						`Result of checkProcessExists(): Process ${executableName} is not running.`
					);
					resolve(false);
				}
			})
			.catch((err) => {
				LOGGER.error(
					`Error checking process named: ${executableName}, had error: \n${err}`
				);
				ps.dispose();
				resolve(false);
			});
	});
};

export const killProcess = async (executablename: string) => {
	let ps = new Shell({
		executionPolicy: 'Bypass',
		noProfile: true,
	});
	return new Promise((resolve) => {
		ps.addCommand(`taskkill /F /IM ${executablename}`);
		ps.invoke()
			.then((success) => {
				ps.dispose();
				if (success) {
					LOGGER.info(
						'Successully killed process with message: ' +
							success.replace('\n', '')
					);
					resolve(true);
				} else {
					LOGGER.error(
						'Failed to kill process (or something idk but no error):\n' +
							success
					);
					resolve(true);
				}
			})
			.catch((error) => {
				LOGGER.error('Failed to kill process. Error:\n' + error);
				ps.dispose();
				resolve(false);
			});
	});
};

export const renameProcess = async (
	executableName: string,
	newName: string,
	path = ASUSACCI_PATH
) => {
	let ps = new Shell({
		executionPolicy: 'Bypass',
		noProfile: true,
	});
	return new Promise((resolve) => {
		ps.addCommand(`ren "${path}/${executableName}" ${newName}`);
		ps.invoke()
			.then((result) => {
				ps.dispose();
				if (result) {
					LOGGER.info('Failed to rename process (or something idk):' + result);
					resolve(true);
				} else {
					LOGGER.info(
						'Successfully renamed ' + executableName + ' to ' + newName
					);
					LOGGER.info(
						'Will now check that execuatable path expected exists...'
					);
					checkExecutableAtPathExists(newName, path).then((result) => {
						if (result) {
							resolve(true);
						} else {
							resolve(false);
						}
					});
				}
			})
			.catch((error) => {
				ps.dispose();
				LOGGER.error('Failed to rename process. Error:\n' + error);
				resolve(false);
			});
	});
};

let hidDevice: hid.HID;

const closeDevice = () => {
	console.log('\nClosing HID device if it exists...');
	if (hidDevice) {
		hidDevice.removeAllListeners();
		hidDevice.close();
	}
};

process.on('SIGINT', closeDevice);
process.on('SIGKILL', closeDevice);
process.on('beforeExit', closeDevice);
process.on('uncaughtException', closeDevice);
export const setUpNewG14ControlKey = async (
	cb: (data: Buffer) => void,
	_?: boolean
) => {
	// Gather all HID devices.
	let devices = hid.devices();
	// Find all HID devices that are made by ASUS and have the
	// 2021 or 2020 G14 product id.
	let deviceInfo = devices.filter(function (d: hid.Device) {
		const { vendorId, productId } = d;
		let DeviceIsKeyboard =
			vendorId === ASUS_VENDOR_ID &&
			(productId === G14_2021 || productId === G14_2020);
		return DeviceIsKeyboard && d.path?.includes('col01');
	});

	if (deviceInfo && deviceInfo.length === 1) {
		// If there is only one device, start listening to the device.
		hidDevice = new hid.HID(deviceInfo[0].path);
		// Make the device listen using the callback that was given to the main function.
		hidDevice.on('data', cb);
		return hidDevice;
	} else if (deviceInfo && deviceInfo.length > 1) {
		LOGGER.error('More than one asus hotkey keyboard found');
		return false;
	} else {
		LOGGER.error('No keyboard found');
		return false;
	}
};

export const killROGKey = async () => {
	await checkRemoveAndRename(ARMCRATE_INTERFACE, ASUSACCI_PATH);
	LOGGER.info('Did thing 1');
	await checkRemoveAndRename(ARMCRATE_KEY_CTRL, ASUSACCI_PATH);
	LOGGER.info('Did thing 2');
	await checkRemoveAndRename(ARMORY_SW_AGENT, ARMORY_SW_AGENT_PATH);
	LOGGER.info('Did thing 3');
	await checkRemoveAndRename(ARMCRATE_SESS_HELPER, ARMCRATE_SVC_PATH);
	LOGGER.info('Did thing 4');
	await checkRemoveAndRename(ARMCRATE_SVC, ARMCRATE_SVC_PATH);
	LOGGER.info('Did thing 5');
	await checkRemoveAndRename(ARMSOCK_SERV, ARMSOCK_SERV_PATH);
	LOGGER.info('Did thing 6');
	await checkRemoveAndRename(ARMCRATE_MANAGER);
	LOGGER.info('Did thing 7');
	await checkRemoveAndRename(ARMCRATE_MANAGER_AGENT);
	return true;
};

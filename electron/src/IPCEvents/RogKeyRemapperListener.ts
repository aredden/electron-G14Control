/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import { g14Config, getROGHID, minMaxFunc, setHidMain } from '../electron';
import getLogger from '../Logger';
import { killROGKey, setUpNewG14ControlKey } from './HID/HIDDevice';
import { undoAllRenames } from './HID/utilities';

const LOGGER = getLogger('RogKeyRemapperListener');

export const buildRogKeyRemapperListener = (
	win: BrowserWindow,
	ipc: IpcMain
) => {
	ipc.handle('disableROG', async () => {
		let result = await killROGKey();
		LOGGER.info('Armoury Crate processes killed & renamed.');
		return result;
	});
	ipc.handle('enableROG', async () => {
		let result = await undoAllRenames();
		LOGGER.info('Armoury Crate executables revived.');
		return result;
	});
	ipc.handle('remapROG', async (event, fnChoice: string, args: string) => {
		if (!g14Config.current.rogKey.enabled) {
			switch (fnChoice) {
				case 'minmax': {
					let result = setUpNewG14ControlKey(mapperBuilder);
					if (result) {
						setHidMain(result);
					}
					return true;
				}
			}
		}
		return false;
	});
	ipc.handle('unbindROG', async () => {
		let hid = getROGHID();
		LOGGER.info(`current hid device: ` + JSON.stringify(hid));
		if (hid) {
			hid.removeAllListeners('data');
			return true;
		} else {
			return false;
		}
	});
};

export const mapperBuilder = (data: Buffer) => {
	if (data.toJSON().data[1] === 56) {
		minMaxFunc();
	}
};

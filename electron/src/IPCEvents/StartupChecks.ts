/** @format */

import { IpcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import { checkBoostVisibility, enableVisibility } from '../Registry/BoostVisibility';
import getLogger from '../Logger';

const LOGGER = getLogger('StartupChecks');
export const buildStartupListeners = (ipc: IpcMain) => {
	ipc.handle('checkBoostVisibility', async (evt: IpcMainInvokeEvent) => {
		let check = await checkBoostVisibility().catch((err) => {
			LOGGER.error(`Caught error checking boost visibility.\nError: ${err}`);
			return 'error';
		});
		LOGGER.info('CheckBoostVisibilityResult ' + check);
		return check;
	});
	ipc.handle('enableBoostVisibility', async (evt: IpcMainInvokeEvent) => {
		let check = await enableVisibility().catch((err) => {
			LOGGER.error(`Caught error checking boost visibility.\nError: ${err}`);
			return 'error';
		});
		LOGGER.info('EnableBoostVisibilityResult ' + check);
		return check;
	});
};

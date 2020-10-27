/** @format */

import { exec } from 'child_process';
import { BrowserWindow, IpcMain } from 'electron';
import getLogger from '../Logger';
import { parsePlans } from '../Utilities';

const LOGGER = getLogger('WindowsPlanListeners');

export const buildWindowsPlanListeners = (
	comms: IpcMain,
	window: BrowserWindow
) => {
	comms.on('getWindowsPlans', async () => {
		const prom = new Promise((resolve) => {
			exec('powercfg /l', (err, stdout, stderr) => {
				if (err || stderr) {
					LOGGER.error(
						`Error getting windows plans guid's from powercfg...\n${JSON.stringify(
							{ err, stderr },
							null,
							2
						)}`
					);
				}
				let parsed = parsePlans(stdout);
				resolve(parsed);
			});
		});
		let parsed = await prom;
		window.webContents.send('winplans', parsed);
	});

	comms.on('getActivePlan', async () => {
		exec('powercfg /getactivescheme', (err, out, stderr) => {
			if (!err && !stderr) {
				let parsed = parsePlans(out);
				if (parsed.length === 1) {
					window.webContents.send('activeplan', parsed[0]);
				}
			} else {
				LOGGER.error(
					`Error getting active windows plan guid's from powercfg...\n${JSON.stringify(
						{ err, stderr },
						null,
						2
					)}`
				);
			}
		});
	});

	comms.on(
		'setWindowsPlan',
		async (_event, datas: { name: string; guid: string }) => {
			exec(`powercfg /setactive ${datas.guid}`, (err, out, stderr) => {
				if (!err) {
					window.webContents.send('setActivePlanStatus', true);
				} else {
					LOGGER.error(JSON.stringify(err));
					window.webContents.send('setActivePlanStatus', false);
				}
			});
		}
	);
};

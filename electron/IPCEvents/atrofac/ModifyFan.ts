/** @format */

import { exec } from 'child_process';
import { BrowserWindow, IpcMain } from 'electron';

const ATRO_LOC = `C:\\Users\\alexa\\Documents\\G14UI\\g14ui\\electron\\atrofac-cli\\atrofac-cli.exe`;

const testCurveValidity = (curve: string): boolean => {
	let reg = new RegExp(/[1]?[0-9]{1}0c:[0-9]{1,2}%,?/, 'g');
	let compiled = reg.exec(curve);

	return false;
};

export const modifyFanCurve = async (ipc: IpcMain, window: BrowserWindow) => {
	return new Promise((resolve, reject) => {
		exec(`${ATRO_LOC} `, (err, out, stderr) => {
			resolve(out);
		});
	});
};

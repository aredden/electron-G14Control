/** @format */
import Shell from 'node-powershell';
import createLogger from '../../Logger';
import is_dev from 'electron-is-dev';
import { app } from 'electron';
import path from 'path';

const LOGGER = createLogger('GPUScripts');

let restartGPULoc = is_dev
	? process.env.RESTART_GPU_LOC
	: path.join(
			app.getPath('exe'),
			'../',
			'resources',
			'extraResources',
			'RestartGPU.exe'
	  );

const ps = new Shell({
	executionPolicy: 'Bypass',
	noProfile: true,
});

export const resetGPU = async () => {
	return new Promise((resolve) => {
		// ps.addCommand(
		// 	'Disable-PnpDevice -InstanceId (Get-PnpDevice -FriendlyName *"NVIDIA Geforce"* -Status OK).InstanceId -Confirm:$false'
		// );
		// ps.addCommand(
		// 	'Enable-PnpDevice -InstanceId (Get-PnpDevice -FriendlyName *"NVIDIA Geforce"* ).InstanceId -Confirm:$false'
		// );
		ps.addCommand(`${restartGPULoc} cli`);
		ps.invoke()
			.then((result) => {
				LOGGER.info('Result resetting GPU:\n' + result);
				resolve(true);
			})
			.catch((err) => {
				resolve(false);
				LOGGER.info('Error recieved after running command:\n' + err.toString());
			});
	});
};

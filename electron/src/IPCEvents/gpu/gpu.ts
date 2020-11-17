/** @format */
import Shell from 'node-powershell';
import createLogger from '../../Logger';
const LOGGER = createLogger('GPUScripts');

const ps = new Shell({
	executionPolicy: 'Bypass',
	noProfile: true,
});

export const resetGPU = async () => {
	return new Promise((resolve) => {
		ps.addCommand(
			'Disable-PnpDevice -InstanceId (Get-PnpDevice -FriendlyName *"NVIDIA Geforce"* -Status OK).InstanceId -Confirm:$false'
		);
		ps.addCommand(
			'Enable-PnpDevice -InstanceId (Get-PnpDevice -FriendlyName *"NVIDIA Geforce"* ).InstanceId -Confirm:$false'
		);
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

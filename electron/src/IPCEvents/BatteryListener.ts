/** @format */

import {BrowserWindow, IpcMain} from 'electron';
import {buildAtkWmi, setBatteryLimiter, whichCharger,} from './WMI/HardwareControl';
import getLogger from '../Logger';
import Shell from 'node-powershell';
import {checkTaskExists} from '../AutoLaunch';

const LOGGER = getLogger('BatteryListener');

const batteryCommand = (enabled: boolean, comnd: string) =>
	enabled
		? `$Action = New-ScheduledTaskAction -Execute 'Powershell.exe' -Argument '-NoProfile -WindowStyle Hidden -command "${comnd}"'
	$Trigger = New-ScheduledTaskTrigger -AtLogOn
	$principal = New-ScheduledTaskPrincipal -UserID "NT AUTHORITY\\SYSTEM" -LogonType ServiceAccount -RunLevel Highest
	$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
	Register-ScheduledTask G14ControlBatteryLimit -Action $Action -Trigger $Trigger -Settings $Settings -Principal $principal`
		: `Unregister-ScheduledTask -TaskName G14ControlBatteryLimit -Confirm:$false`;

export const buildBatterySaverListener = (win: BrowserWindow, ipc: IpcMain) => {
	ipc.handle('setBatteryLimiter', async (event, value: number) => {
		await setBatteryLimiter(value);
		return (await setLimit(value)) as boolean;
	});

	ipc.handle('isPlugged', async (event) => {
		return await whichCharger();
	});
};

const removeTask = async () => {
	return new Promise((resolve) => {
		let shell = new Shell({ executionPolicy: 'Bypass', noProfile: true });
		shell.addCommand(
			`Unregister-ScheduledTask -TaskName G14ControlBatteryLimit -Confirm:$false`
		);
		shell
			.invoke()
			.then((resul) => {
				if (resul) {
					LOGGER.error(
						'There was a problem removing battery limit Task Scheduler command.\n' +
							JSON.stringify(resul, null, 2)
					);
					resolve(false);
					shell.dispose();
				} else {
					LOGGER.info(`Successfully removed previous task:\n${resul}`);
					resolve(true);
					shell.dispose();
				}
			})
			.catch((err) => {
				LOGGER.error(
					'There was a problem removing battery limit Task Scheduler command.\n' +
						JSON.stringify(err, null, 2)
				);
				resolve(false);
				shell.dispose();
			});
	});
};

const setLimit = async (amt: number) => {
	return new Promise(async (resolve) => {
		let exist = await checkTaskExists('G14ControlBatteryLimit');
		if (exist) {
			await removeTask();
		}
		let command = buildAtkWmi('DEVS', '0x00120057', amt);
		let addCommand = batteryCommand(true, command);
		let sh = new Shell({
			executionPolicy: 'Bypass',
			noProfile: true,
		});
		sh.addCommand(addCommand);
		sh.invoke()
			.then((result) => {
				if (result) {
					LOGGER.info('Result of limit command: \n' + result);
					resolve(true);
					sh.dispose();
				} else {
					LOGGER.error(
						'There was a problem setting battery limit Task Scheduler command.'
					);
					resolve(false);
					sh.dispose();
				}
			})
			.catch((err) => {
				LOGGER.error(
					'There was an error setting Task Scheduler task: \n' + err
				);
				resolve(false);
				sh.dispose();
			});
	});
};

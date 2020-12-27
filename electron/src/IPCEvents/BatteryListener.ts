/** @format */

import {BrowserWindow, IpcMain} from 'electron';
import {buildAtkWmi, setBatteryLimiter,removeBatteryLimiter, whichCharger,} from './WMI/HardwareControl';
import getLogger from '../Logger';
import Shell from 'node-powershell';
import {checkTaskExists} from '../AutoLaunch';

const LOGGER = getLogger('BatteryListener');

const batteryCommand = (enabled: boolean, comnd?: string) =>
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

	ipc.handle('removeBatteryLimiter', async (event) => {
		await removeBatteryLimiter();
		return (await removeLimit());
	});

	ipc.handle('isPlugged', async (event) => {
		return await whichCharger();
	});
};

const removeLimit = async () => {
	return new Promise((resolve) => {
		let ps = new Shell({ executionPolicy: 'Bypass', noProfile: true });
		ps.addCommand(batteryCommand(false));
		ps.invoke()
			.then((resul) => {
				ps.dispose();
				if (resul) {
					LOGGER.error(
						'There was a problem removing battery limit Task Scheduler command.\n' +
							JSON.stringify(resul, null, 2)
					);
					resolve(false);
				} else {
					LOGGER.info(`Successfully removed previous task:\n${resul}`);
					resolve(true);
				}
			})
			.catch((err) => {
				ps.dispose();
				LOGGER.error(
					'There was a problem removing battery limit Task Scheduler command.\n' +
						JSON.stringify(err, null, 2)
				);
				resolve(false);
			});
	});
};

const setLimit = async (amt: number) => {
	return new Promise(async (resolve) => {
		let exist = await checkTaskExists('G14ControlBatteryLimit');
		if (exist) {
			await removeLimit();
		}
		let command = buildAtkWmi('DEVS', '0x00120057', amt);
		let addCommand = batteryCommand(true, command);
		let ps = new Shell({
			executionPolicy: 'Bypass',
			noProfile: true,
		});
		ps.addCommand(addCommand);
		ps.invoke()
			.then((result) => {
				ps.dispose();
				if (result) {
					LOGGER.info('Result of limit command: \n' + result);
					resolve(true);
				} else {
					LOGGER.error(
						'There was a problem setting battery limit Task Scheduler command.'
					);
					resolve(false);
				}
			})
			.catch((err) => {
				ps.dispose();
				LOGGER.error(
					'There was an error setting Task Scheduler task: \n' + err
				);
				resolve(false);
			});
	});
};

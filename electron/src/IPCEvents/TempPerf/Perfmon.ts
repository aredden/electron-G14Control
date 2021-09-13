/** @format */

import { BrowserWindow } from 'electron';
import perfmon, { PerfmonStream } from 'perfmon';
import Shell from 'node-powershell';
import getLogger from '../../Logger';
import { getConfig } from '../../electron';

const LOGGER = getLogger('Perfmon');

const defaultCounters = {
	thermal: '\\Thermal Zone Information(*)\\High Precision Temperature',
	battery: '\\Power Meter(_Total)\\Power',
};

export const buildPerfmonThermalProcess = async (win: BrowserWindow, retryIfFail = true) => {
	const { newLanguageSupport } = getConfig().current;

	let localeCounters: { thermal: string; battery: string } | false = false;
	if (retryIfFail && newLanguageSupport) {
		localeCounters = await getCounterLocaleName();
	}
	let finalCounters = [];
	if (localeCounters) {
		finalCounters.push(...[localeCounters.battery, localeCounters.thermal]);
	} else {
		finalCounters.push(...[defaultCounters.battery, defaultCounters.thermal]);
	}
	let perf: PerfmonStream;
	perf = perfmon(finalCounters, async (err: any, data: any) => {
		if (!err) {
			let highPrecisionTemp = data.counters[finalCounters[1]];
			let resultingTemp = highPrecisionTemp / 10 - 275.15;
			if (resultingTemp > -100) {
				win.webContents.send('cpuTemperature', resultingTemp);
			}
			let discharge = data.counters[finalCounters[0]];
			win.webContents.send('dischargeRate', discharge);
		} else {
			LOGGER.info(`ERROR getting info from perfmon.js${JSON.stringify(err, null, 2)}`);
			if (retryIfFail) {
				perf = await buildPerfmonThermalProcess(win, false);
			}
		}
	});
	return perf;
};

export const getCounterLocaleName = async () => {
	const thermal = 6278,
		highPrec = 6286,
		batStatus = 9152,
		discharge = 9164;
	let r = await Promise.all([
		addThenInvokeMLCommand(getLocaleFromID(thermal)),
		addThenInvokeMLCommand(getLocaleFromID(highPrec)),
		addThenInvokeMLCommand(getLocaleFromID(batStatus)),
		addThenInvokeMLCommand(getLocaleFromID(discharge)),
	]);
	if (r[0] && r[1] && r[2] && r[3]) {
		return {
			thermal: `\\${r[0].replace(/\r\n*/, '')}(*)\\${r[1].replace(/\r\n*/, '')}`,
			battery: `\\${r[2].replace(/\r\n*/, '')}(_Total)\\${r[3].replace(/\r\n*/, '')}`,
		};
	} else {
		return false;
	}
};

const addThenInvokeMLCommand = async (...multiLineCommand: any[]) => {
	const ps = new Shell({});
	ps.on('end', (code) => {
		ps.dispose();
	});
	multiLineCommand.forEach((line) => {
		const commandArray = line.split('\n');
		commandArray.forEach((val) => {
			ps.addCommand(val + `\n`);
		});
	});
	return new Promise<string | false>((resolve) => {
		ps.invoke()
			.then((result) => {
				resolve(result);
			})
			.catch((err) => {
				LOGGER.error(typeof err === 'string' ? err : JSON.stringify(err, null, 2));
				resolve(false);
			});
	});
};

const getLocaleFromID: (id: string | number) => string = (
	id: number | string
) => `$ComputerName = $env:COMPUTERNAME
$code = '[DllImport("pdh.dll", SetLastError=true, CharSet=CharSet.Unicode)] public static extern UInt32 PdhLookupPerfNameByIndex(string szMachineName, uint dwNameIndex, System.Text.StringBuilder szNameBuffer, ref uint pcchNameBufferSize);'
$Buffer = New-Object System.Text.StringBuilder(1024)
[UInt32]$BufferSize = $Buffer.Capacity
$t = Add-Type -MemberDefinition $code -PassThru -Name PerfCounter -Namespace Utility
$rv = $t::PdhLookupPerfNameByIndex($ComputerName, ${id}, $Buffer, [Ref]$BufferSize)
if ($rv -eq 0) { $Buffer.ToString().Substring(0, $BufferSize-1) } else { Throw 'Get-PerformanceCounterLocalName : Unable to retrieve localized name. Check computer name and performance counter ID.' }`;

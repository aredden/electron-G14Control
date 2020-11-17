/** @format */
/* eslint-disable @typescript-eslint/no-unused-vars*/
import { spawn } from 'child_process';
import getLogger from '../Logger';
import { buildSoftwareMap, formatGetWmiobject } from './WMI/ComputerInfoUtils';

const LOGGER = getLogger('ComputerInfo');

let softwareMap: Map<string, Map<string, string>>;
let cpubiosMap: Map<string, string>;

let count = 0;

const buildMap = (datas: Array<string>) => {
	let mapmap = new Map();
	datas.map((value) => {
		let newVal = value.split(':');
		mapmap.set(
			newVal[0].replace(/ /gm, ''),
			newVal[1].replace(/^ | {2}/gm, '')
		);
		return null;
	});

	cpubiosMap = mapmap;
};
let powershellResultArray: any[] = [];
let softwareString = '';
const checkIfPrint = () => {
	count = count - 1;
	if (count <= 0) {
		buildMap(powershellResultArray);
	}
};

const buildSoftwareList = () => {
	let softchild = spawn('powershell.exe', [
		`Get-WmiObject win32_product | where-object { $_.vendor -like "*ASUS*" -or $_.vendor -like "*Advanced Micro Devices*" -or $_.vendor -like "*AMD*" } | Select-Object Name,Vendor,Version | Format-List *`,
	]);
	softchild.stdout.on('data', (data) => {
		softwareString = softwareString + data.toString();
	});
	softchild.stderr.on('data', (err) => {
		LOGGER.info(err.toString());
	});
	softchild.on('error', (err) => {
		LOGGER.info(err.toString());
	});
	softchild.on('exit', () => {
		let form = formatGetWmiobject(softwareString);
		let mapo = buildSoftwareMap(form);
		softwareMap = mapo;
	});
	return softchild;
};

const buildPsSpawn = (args: string) => {
	count = count + 1;
	let childo = spawn('powershell.exe', [args]);

	childo.stdout.on('data', (data) => {
		powershellResultArray.push(...formatGetWmiobject(data));
	});

	childo.on('exit', () => {
		checkIfPrint();
	});
	return childo;
};

let a = buildPsSpawn(
	'Get-WmiObject -class Win32_Processor | Select-Object ' +
		'Name,ProcessorId,NumberOfCores,NumberOfEnabledCore,ThreadCount,NumberOfLogicalProcessors,' +
		'L2CacheSize,L3CacheSize,Status,Description,MaxClockSpeed | Format-List *'
);
let b = buildPsSpawn(
	'Get-WmiObject -Class "Win32_ComputerSystem" | Select-Object SystemFamily,TotalPhysicalMemory,Manufacturer,Model | Format-List *'
);
let c = buildPsSpawn(
	'Get-CimInstance -ClassName Win32_BIOS | Select-Object SMBIOSBIOSVersion,ReleaseDate,SerialNumber | Format-List *'
);

let d = buildSoftwareList();

export const refreshCpuBiosMap = () => {
	a = buildPsSpawn(
		'Get-WmiObject -class Win32_Processor | Select-Object ' +
			'Name,ProcessorId,NumberOfCores,NumberOfEnabledCore,ThreadCount,NumberOfLogicalProcessors,' +
			'L2CacheSize,L3CacheSize,Status,Description,MaxClockSpeed | Format-List *'
	);
	b = buildPsSpawn(
		'Get-WmiObject -Class "Win32_ComputerSystem" | Select-Object SystemFamily,TotalPhysicalMemory,Manufacturer,Model | Format-List *'
	);
	c = buildPsSpawn(
		'Get-CimInstance -ClassName Win32_BIOS | Select-Object SMBIOSBIOSVersion,ReleaseDate,SerialNumber | Format-List *'
	);
};

export const refreshSoftwareMap = () => {
	d = buildSoftwareList();
};

const checkSMap = (resolve: (val: any) => void) => {
	setTimeout(() => {
		if (softwareMap) {
			resolve(softwareMap);
		} else {
			checkSMap(resolve);
		}
	}, 2000);
};

export const getSoftware = async () => {
	return new Promise((resolve) => {
		if (softwareMap) {
			resolve(softwareMap);
		} else {
			checkSMap(resolve);
		}
	});
};

const checkPBMap = (resolve: (val: any) => void) => {
	setTimeout(() => {
		if (cpubiosMap) {
			resolve(cpubiosMap);
		} else {
			checkPBMap(resolve);
		}
	}, 2000);
};

export const getBiosCpu = async () => {
	return new Promise((resolve) => {
		if (cpubiosMap) {
			resolve(cpubiosMap);
		} else {
			checkPBMap(resolve);
		}
	});
};

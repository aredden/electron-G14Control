/** @format */
/* eslint-disable @typescript-eslint/no-unused-vars*/
import { spawn } from 'child_process';
import getLogger from '../Logger';
import {
	buildDriverMap,
	buildSoftwareMap,
	formatGetWmiobject,
} from './WMI/ComputerInfoUtils';

const LOGGER = getLogger('ComputerInfo');

let softwareMap: Map<string, Map<string, string>>;
let cpubiosMap: Map<string, string>;
let driverMap: Map<string, string>;
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
let driverString = '';
const checkIfPrint = () => {
	count = count - 1;
	if (count <= 0) {
		buildMap(powershellResultArray);
	}
};

const buildSoftwareList = () => {
	let softchild = spawn('powershell.exe', [
		`Get-WmiObject win32_product | where-object { $_.vendor -like "*ASUS*" -or $_.vendor -like "*Advanced Micro Devices*" -or $_.vendor -like "*AMD*" -or $_.vendor -like "*Intel*" -or $_.vendor -like "*NVIDIA*" } | Select-Object Name,Vendor,Version | Format-List *`,
	]);
	softchild.stdout.on('data', (data) => {
		softwareString = softwareString + data.toString();
	});
	softchild.stderr.on('data', (err) => {
		LOGGER.error('Error getting data from software query:\n' + err.toString());
	});
	softchild.on('error', (err) => {
		LOGGER.error('Error getting data from software query:\n' + err.toString());
	});
	softchild.on('exit', () => {
		let form = formatGetWmiobject(softwareString);
		let mapo = buildSoftwareMap(form);
		softwareMap = mapo;
	});
	return softchild;
};

const GET_G14_DRIVERS = `Get-WmiObject Win32_PnPSignedDriver| select devicename, driverversion | where-object { $_.devicename -like "*ASUS*" -or $_.devicename -like "*Advanced Micro Devices*" -or $_.devicename -like "*AMD*" -or $_.devicename -like "*Intel*" -or $_.devicename -like "*NVIDIA*" } | Format-List *`;

const buildPsSpawn = (args: string) => {
	count = count + 1;
	let childo = spawn('powershell.exe', [args]);

	childo.stderr.on('error', (err) => {
		LOGGER.error(
			`Powershell Spawn (from ComputerInfo.tsx resulted in error:\n${err}`
		);
	});

	childo.stdout.on('data', (data) => {
		powershellResultArray.push(...formatGetWmiobject(data));
	});

	childo.on('exit', () => {
		checkIfPrint();
	});
	return childo;
};

const buildDriverList = () => {
	let child = spawn('powershell.exe', [GET_G14_DRIVERS]);

	child.stdout.on('data', (data) => {
		driverString = driverString + data.toString();
	});
	child.stderr.on('data', (data) => {
		LOGGER.info(`Error building driver string from child: ${data.toString()}`);
	});
	child.on('error', (err) => {
		LOGGER.error('Error building driver list:\n' + err.toString());
	});
	child.on('exit', () => {
		let form = formatGetWmiobject(driverString);
		let mapo = buildDriverMap(form);
		driverMap = mapo;
	});
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

let f = buildDriverList();

export const refreshCpuBiosMap = () => {
	count = 0;
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

export const refreshAllMaps = () => {
	cpubiosMap = undefined;
	softwareMap = undefined;
	driverMap = undefined;
	driverString = '';
	softwareString = '';
	refreshCpuBiosMap();
	d = buildSoftwareList();
	f = buildDriverList();
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

const checkDriverMap = (resolve: (val: any) => void) => {
	setTimeout(() => {
		if (driverMap) {
			resolve(driverMap);
		} else {
			checkDriverMap(resolve);
		}
	});
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

export const getDrivers = async () => {
	return new Promise((resolve) => {
		if (driverMap) {
			resolve(driverMap);
		} else {
			checkDriverMap(resolve);
		}
	});
};

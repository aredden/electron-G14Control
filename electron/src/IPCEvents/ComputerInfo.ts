/** @format */

import { spawn } from 'child_process';
import getLogger from '../Logger';

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
let thingo = [];
let softwareString = '';
const checkIfPrint = () => {
	count = count - 1;
	if (count <= 0) {
		buildMap(thingo);
	}
};

const buildSoftwareMap = (ar: Array<string>) => {
	let lemap = new Map();
	for (let i = 0; i < ar.length; i += 3) {
		let innermap = new Map();
		let name = ar[i].split(':');
		let nkey = name[0].replace(/ /gm, '');
		let nval = name[1].replace(/^ | {2}/gm, '');
		innermap.set(nkey, nval);
		let vendor = ar[i + 1].split(':');
		let vkey = vendor[0].replace(/ /gm, '');
		let vval = vendor[1].replace(/^ | {2}/gm, '');
		innermap.set(vkey, vval);
		let version = ar[i + 2].split(':');
		let vskey = version[0].replace(/ /gm, '');
		let vsval = version[1].replace(/^ | {2}/gm, '');
		innermap.set(vskey, vsval);
		lemap.set(nval, new Map(innermap));
	}
	return lemap;
};

const formatGetWmiobject = (str: string) => {
	return str
		.toString()
		.replace(/\r/gm, '')
		.split('\n')
		.filter((num) => num !== '');
};

const buildSoftwareList = () => {
	let softchild = spawn('powershell.exe', [
		`Get-WmiObject win32_product | where-object { $_.vendor -like "*ASUS*" -or $_.vendor -like "*Advanced Micro Devices*" -or $_.vendor -like "*AMD*" } | Select-Object Name,Vendor,Version | Format-List *`,
	]);
	softchild.stdout.on('data', (data) => {
		softwareString = softwareString + data.toString();
		LOGGER.info(data.toString());
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
		thingo.push(...formatGetWmiobject(data));
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

/** @format */

export const buildSoftwareMap = (ar: Array<string>) => {
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

export const buildDriverMap = (ar: Array<string>) => {
	let lemap = new Map();
	for (let i = 0; i < ar.length; i += 2) {
		let devicename = '';
		let driverversion = '';
		let name = ar[i].split(':');
		let nval = name[1].replace(/^ | {2}/gm, '');
		devicename = nval;
		let vendor = ar[i + 1].split(':');
		let vval = vendor[1].replace(/^ | {2}/gm, '');
		driverversion = vval;
		lemap.set(devicename, driverversion);
	}
	return lemap;
};

export const formatGetWmiobject = (str: string) => {
	return str
		.toString()
		.replace(/\r/gm, '')
		.split('\n')
		.filter((num) => num !== '');
};

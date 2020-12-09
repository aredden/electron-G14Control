/** @format */

declare type RyzenadjConfig = {
	stapmLimit?: number;
	fastLimit?: number;
	slowLimit?: number;
	slowTime?: number;
	stapmTime?: number;
	tctlTemp?: number;
};

declare type DisplayOptions = {
	refresh?: number;
	display?: number;
	width?: number;
	height?: number;
};

declare type CpuBiosMapValues = {
	processorData: {
		Name: string;
		Process: string;
		NumberOfCores: string;
		NumberOfEnabledCore: string;
		ThreadCount: string;
		NumberOfLogicalProcessors: string;
		L2CacheSize: string;
		L3CacheSize: string;
		Status: string;
		Description: string;
		MaxClockSpeed: string;
	};
	computerSystem: {
		SystemFamily: string;
		TotalPhysicalMemory: string;
		Manufacturer: string;
		Model: string;
	};
	biosData: {
		SMBIOSBIOSVersion: string;
		ReleaseDate: string;
		SerialNumber: string;
	};
};

declare type ArmoryPlan = 'windows' | 'silent' | 'performance' | 'turbo';

declare type DisplayOptionData = {
	resolution: {
		width: number;
		height: number;
	};
	bits: number;
	refresh: number;
	format: string;
};

declare type RyzenadjConfigNamed = {
	name: string;
	stapmLimit: number;
	fastLimit: number;
	slowLimit: number;
	slowTime: number;
	stapmTime: number;
	tctlTemp: number;
};

declare type ShortCuts = {
	minmax: {
		enabled: boolean;
		accelerator: string;
	};
};

declare type RogKeyConfig = {
	enabled: boolean;
	func: string;
	armoryCrate: boolean;
};
declare type G14Config = {
	startup: {
		checkBoostVisibility: boolean;
		autoLaunchEnabled: boolean;
	};
	current: {
		ryzenadj: string;
		fanCurve: {
			type: 'Custom' | 'Armoury';
			name: string;
		};
		batteryLimit: number | undefined;
		shortcuts: {
			minmax: {
				enabled: boolean;
				accelerator: string;
			};
		};
		rogKey: RogKeyConfig;
	};
	plans: G14ControlPlan[];
	ryzenadj: {
		defaults: RyzenadjConfig;
		limits: RyzenadjConfig;
		options: RyzenadjConfigNamed[];
	};
	loopTimes: {
		temp: number;
		load: number;
	};
	armouryPlan: ArmoryPlan;
	fanCurves: Array<{
		name: string;
		cpu: number[];
		gpu: number[];
	}>;
	displayOptions: DisplayOptionData[];
};
declare type G14ControlPlan = {
	name: string;
	ryzenadj: string;
	fanCurve: string;
	boost: number;
	armouryCrate: ArmoryPlan;
	graphics: number;
	windowsPlan: { name: string; guid: string };
};

declare type FullG14ControlPlan = {
	name: string;
	ryzenadj: RyzenadjConfigNamed;
	fanCurve: {
		name: string;
		cpu: undefined | number[];
		gpu: undefined | number[];
	};
	boost: number;
	armouryCrate: ArmoryPlan;
	graphics: number;
	windowsPlan: { name: string; guid: string };
};

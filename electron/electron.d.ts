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

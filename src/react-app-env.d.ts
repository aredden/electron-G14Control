/** @format */

/// <reference types="react-scripts" />

declare module 'chartjs-plugin-draggable' {}
declare module 'chartjs-plugin-dragdata' {}
declare type RyzenadjConfig = {
	stapmLimit: number;
	fastLimit: number;
	slowLimit: number;
	slowTime: number;
	stapmTime: number;
	tctlTemp: number;
};
declare type RyzenFormItem = {
	formLabel: string;
	min: number;
	max: number;
	caseKey: string;
	value: number;
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

declare type ArmoryPlan = 'windows' | 'silent' | 'performance' | 'turbo';

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

declare type G14Config = {
	ryzenadj: {
		defaults: RyzenadjConfig;
		limits: RyzenadjConfig;
		options: RyzenadjConfigNamed[];
	};
	loopTimes: {
		temp: number;
		load: number;
	};
	fanCurves: Array<{
		name: string;
		plan: ArmoryPlan;
		cpu: number[];
		gpu: number[];
	}>;
	displayOptions: DisplayOptionData[];
};

declare type FanCurveConfig = {
	name: string;
	plan: ArmoryPlan;
	cpu: number[];
	gpu: number[];
};

declare type FanCurveArray = Array<FanCurveConfig>;

declare type DisplayOptionData = {
	resolution: {
		width: number;
		height: number;
	};
	bits: number;
	refresh: number;
	format: string;
};

declare type DisplayOptionListType = {
	bits: number;
	refresh: number;
	format: string;
	resolution: string;
};

/** @format */

declare type DisplayOptions = {
	refresh?: number;
	display?: number;
	width?: number;
	height?: number;
};

declare module 'wmi-client';

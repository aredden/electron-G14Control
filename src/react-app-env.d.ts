/** @format */

/// <reference types="react-scripts" />

declare module 'chartjs-plugin-draggable' {}
declare module 'chartjs-plugin-dragdata' {}
declare type RyzenadjConfig = {
	stapmLimit?: number;
	fastLimit?: number;
	slowLimit?: number;
	slowTime?: number;
	stapmTime?: number;
	tctlTemp?: number;
};

declare type ArmoryPlan = 'windows' | 'silent' | 'performance' | 'turbo';

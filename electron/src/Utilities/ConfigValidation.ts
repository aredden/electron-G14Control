/** @format */

import { Schema, Validator } from 'jsonschema';

export let configSchema: Schema = {
	id: '/g14config',
	type: 'object',
	required: ['startup', 'current', 'plans', 'ryzenadj', 'fanCurves'],
	properties: {
		autoSwitch: {
			type: 'object',
			properties: {
				enabled: { type: 'boolean' },
				acPlan: { type: 'object' },
				dcPlan: { type: 'object' },
			},
		},
		f5Switch: {
			type: 'object',
			properties: {
				enabled: { type: 'boolean' },
				f5Plans: { type: 'array' },
			},
		},
		startup: {
			properties: {
				checkBoostVisibility: { type: 'boolean' },
				autoLaunchEnabled: { type: 'boolean' },
				startMinimized: { type: 'boolean', required: false },
			},
			type: 'object',
		},
		current: {
			properties: {
				ryzenadj: { type: 'string' },
				minToTray: { type: 'boolean', required: false },
				fanCurve: {
					properties: {
						type: { type: 'any' },
						name: { type: 'string' },
					},
				},
				batteryLimit: { type: 'number | undefined' },
				batteryLimitStatus: { type: 'boolean', required: false },
				shortcuts: {
					required: false,
					properties: {
						minmax: {
							properties: {
								enabled: { type: 'boolean' },
								accelerator: { type: 'string' },
							},
						},
					},
				},
				rogKey: { type: 'any' },
			},
		},
		plans: { type: 'array' },
		ryzenadj: {
			required: true,
			properties: {
				defaults: { type: 'object' },
				limits: { type: 'object' },
				options: { type: 'array' },
			},
		},
		loopTimes: {
			type: 'any',
		},
		armouryPlan: { type: 'string' },
		fanCurves: { type: 'array' },
	},
};

let validator = new Validator();
validator.addSchema(configSchema, '/g14config');
export default validator;

/** @format */

import {
	configureStore,
	createAction,
	createReducer,
	EnhancedStore,
} from '@reduxjs/toolkit';
import { capitalize } from 'lodash';

export let store: EnhancedStore;

export const initStore = async (initialState: G14Config) => {
	store = configureStore({
		reducer: createRootReducer(initialState),
		devTools: process.env.NODE_ENV !== 'production',
	});
	store.subscribe(async () => {
		let state = store.getState();
		await window.ipcRenderer.invoke('saveConfig', state);
	});
	return store;
};

export const updateShortcuts = createAction(
	'EDIT_SHORTCUTS',
	(value: ShortCuts) => {
		return { payload: value };
	}
);

export const updateBatteryLimit = createAction(
	'UPDATE_BATTERY_LIMIT',
	(value: number) => {
		return { payload: value };
	}
);

export const updateArmouryPlan = createAction(
	'UPDATE_ARMOURY_PLAN',
	(value: ArmoryPlan) => {
		return { payload: value };
	}
);

export const updateCurrentConfig = createAction(
	'UPDATE_CURRENT_CONFIG',
	(value: {
		ryzenadj: string;
		fanCurve: {
			type: 'Custom' | 'Armoury';
			name: string;
		};
	}) => {
		return { payload: value };
	}
);

export const updateLoopTimes = createAction(
	'UPDATE_LOOPTIMES',
	(value: { temp: number; load: number }) => {
		return { payload: value };
	}
);
export const updateFanConfig = createAction(
	'UPDATE_FAN_CONFIG',
	(value: FanCurveArray) => {
		return { payload: value };
	}
);
export const updateRyzenadjConfig = createAction(
	'UPDATE_RYZENADJ_CONFIG',
	(value: RyzenadjConfig) => {
		return { payload: value };
	}
);

export const updateDisplayOptions = createAction(
	'UPDATE_DISPLAY_OPTIONS',
	(value: DisplayOptionData[]) => {
		return { payload: value };
	}
);

export const updateStartOnBoot = createAction(
	'UPDATE_START_ON_BOOT',
	(value: boolean) => {
		return { payload: value };
	}
);

export const updateROGKey = createAction(
	'UPDATE_ROG_KEY',
	(value: RogKeyConfig) => {
		return { payload: value };
	}
);

export const updateG14Plans = createAction(
	'UPDATE_G14_PLANS',
	(value: G14ControlPlan[]) => {
		return { payload: value };
	}
);

export const setCurrentG14ControlPlan = createAction(
	'SET_CURRENT_G14PLAN',
	(value: G14ControlPlan) => {
		return { payload: value };
	}
);

export const setStartMinimized = createAction(
	'START_MINIMIZED',
	(value: boolean) => {
		return { payload: value };
	}
);

export const setMinToTray = createAction(
	'SET_MIN_TO_TRAY',
	(value: boolean) => {
		return { payload: value };
	}
);

const createRootReducer = (initialState: G14Config) => {
	let reducer = createReducer(initialState, (reducer) => {
		/**
		 * Fan Config Store
		 */
		reducer.addCase(updateLoopTimes, (state, action) => {
			let { temp, load } = action.payload;
			state.loopTimes = {
				temp: temp ? temp : state.loopTimes.temp,
				load: load ? load : state.loopTimes.load,
			};
			return state;
		});
		/**
		 * Loop Times Store
		 */
		reducer.addCase(updateFanConfig, (state, action) => {
			state.fanCurves = action.payload;
			return state;
		});
		/**
		 * Ryzenadj Store
		 */
		reducer.addCase(updateRyzenadjConfig, (state, action) => {
			let {
				tctlTemp,
				slowLimit,
				fastLimit,
				slowTime,
				stapmLimit,
				stapmTime,
			} = action.payload;
			let newState = Object.assign(state, {
				ryzenadj: {
					defaults: {
						tctlTemp: tctlTemp as number,
						slowLimit: slowLimit as number,
						fastLimit: fastLimit as number,
						slowTime: slowTime as number,
						stapmLimit: stapmLimit as number,
						stapmTime: stapmTime as number,
					},
					options: state.ryzenadj.options,
					limits: state.ryzenadj.limits,
				},
			});
			state = newState;
			return state;
		});

		reducer.addCase(updateDisplayOptions, (state, action) => {
			let { payload } = action;
			let newState = Object.assign(state, {
				displayOptions: payload,
			});
			state = newState;
			return state;
		});

		reducer.addCase(updateCurrentConfig, (state, action) => {
			let { payload } = action;

			let newState = Object.assign(state, {
				current: {
					...payload,
					rogKey: state.current.rogKey,
					batteryLimit: state.current.batteryLimit,
					shortcuts: state.current.shortcuts,
				},
			});
			state = newState;
			return state;
		});

		reducer.addCase(updateStartOnBoot, (state, action) => {
			let { payload } = action;
			let newState = Object.assign(state, {
				startup: {
					checkBoostVisibility: state.startup.checkBoostVisibility,
					autoLaunchEnabled: payload,
					startMinimized: state.startup.startMinimized,
				},
			});
			state = newState;
			return state;
		});

		reducer.addCase(updateBatteryLimit, (state, action) => {
			let newState: G14Config = Object.assign(state, {
				current: {
					ryzenadj: state.current.ryzenadj,
					fanCurve: state.current.fanCurve,
					rogKey: state.current.rogKey,
					batteryLimit: action.payload,
					shortcuts: state.current.shortcuts,
				},
			});
			state = newState;
			return state;
		});

		reducer.addCase(updateShortcuts, (state, action) => {
			let newState: G14Config = Object.assign(state, {
				current: {
					ryzenadj: state.current.ryzenadj,
					fanCurve: state.current.fanCurve,
					batteryLimit: state.current.batteryLimit,
					rogKey: state.current.rogKey,
					shortcuts: action.payload,
				},
			});
			state = newState;
			return state;
		});

		reducer.addCase(updateROGKey, (state, action) => {
			let { ryzenadj, fanCurve, batteryLimit, shortcuts } = state.current;
			let newState: G14Config = Object.assign(state, {
				current: {
					ryzenadj,
					fanCurve,
					batteryLimit,
					shortcuts,
					rogKey: {
						enabled: action.payload.enabled,
						func: action.payload.func,
						armouryCrate: action.payload.armouryCrate,
					},
				},
			});
			state = newState;
			return state;
		});

		reducer.addCase(updateG14Plans, (state, action) => {
			state = Object.assign(state, { plans: action.payload });
			return state;
		});
		reducer.addCase(updateArmouryPlan, (state, action) => {
			let { ryzenadj, batteryLimit, shortcuts, rogKey } = state.current;
			let newState: G14Config = Object.assign(state, {
				current: {
					ryzenadj,
					fanCurve: {
						type: 'Armoury',
						name: capitalize(action.payload),
					},
					batteryLimit,
					shortcuts,
					rogKey,
				},
				armouryPlan: action.payload,
			});
			state = newState;
			return state;
		});

		reducer.addCase(setCurrentG14ControlPlan, (state, action) => {
			let { ryzenadj: adj, fanCurve: crv, armouryCrate } = action.payload;
			if (armouryCrate && !crv) {
				state.current.fanCurve.type = 'Armoury';
				state.current.fanCurve.name = armouryCrate;
			} else if (crv) {
				state.current.fanCurve.type = 'Custom';
				state.current.fanCurve.name = crv;
			}
			if (adj) {
				state.current.ryzenadj = adj;
			}
			return state;
		});

		reducer.addCase(setStartMinimized, (state, action) => {
			state.startup = Object.assign(state.startup, {
				startMinimized: action.payload,
			});
			return state;
		});

		reducer.addCase(setMinToTray, (state, action) => {
			state.current = Object.assign(state.current, {
				minToTray: action.payload,
			});
			return state;
		});
	});
	return reducer;
};

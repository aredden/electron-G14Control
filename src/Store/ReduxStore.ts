/** @format */

import {
	configureStore,
	createAction,
	createReducer,
	EnhancedStore,
} from '@reduxjs/toolkit';

export let store: EnhancedStore;

export const updateStore = async (newConfig: G14Config) => {
	store = configureStore({
		reducer: createRootReducer(newConfig),
		devTools: process.env.NODE_ENV !== 'production',
	});
};

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

export const updateBatteryLimitStatus = createAction(
	'UPDATE_BATTERY_LIMIT_STATUS',
	(value: boolean) => {
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

export const setACAutoPowerSwitching = createAction(
	'SET_AUTO_SWITCH_AC',
	(value: G14ControlPlan) => {
		return { payload: value };
	}
);

export const setDCAutoPowerSwitching = createAction(
	'SET_AUTO_SWITCH_DC',
	(value: G14ControlPlan) => {
		return { payload: value };
	}
);

export const setAutoSwitchingEnabled = createAction(
	'SET_AUTO_SWITCH_ENABLED',
	(value: boolean) => {
		return { payload: value };
	}
);

export const addRyzenadjPlan = createAction(
	'ADD_RYZENADJ_PLAN',
	(value: RyzenadjConfigNamed) => {
		return { payload: value };
	}
);

export const removeRyzenadjPlan = createAction(
	'REM_RYZENADJ_PLAN',
	(value: RyzenadjConfigNamed) => {
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
			state.current = Object.assign(state.current, {
				ryzenadj: action.payload.ryzenadj,
				fanCurve: {
					type: payload.fanCurve.type,
					name: payload.fanCurve.name,
				},
			});
			return state;
		});

		reducer.addCase(updateStartOnBoot, (state, action) => {
			let { payload } = action;
			state.startup = Object.assign(state.startup, {
				autoLaunchEnabled: payload,
			});
			return state;
		});

		reducer.addCase(updateBatteryLimit, (state, action) => {
			state.current = Object.assign(state.current, {
				batteryLimit: action.payload,
			});
			return state;
		});

		reducer.addCase(updateBatteryLimitStatus, (state, action) => {
			state.current = Object.assign(state.current, {
				batteryLimitStatus: action.payload,
			});
			return state;
		});

		reducer.addCase(updateROGKey, (state, action) => {
			state.current.rogKey = Object.assign(state.current.rogKey, {
				enabled: action.payload.enabled,
				func: action.payload.func,
				armouryCrate: action.payload.armouryCrate,
			});
			return state;
		});

		reducer.addCase(updateG14Plans, (state, action) => {
			state = Object.assign(state, { plans: action.payload });
			return state;
		});
		reducer.addCase(updateArmouryPlan, (state, action) => {
			state.armouryPlan = action.payload;
			state.current = Object.assign(state.current, {
				fanCurve: {
					type: 'Armoury',
					name: action.payload,
				},
			});
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

		reducer.addCase(setAutoSwitchingEnabled, (state, action) => {
			let { autoSwitch } = state;
			state.autoSwitch = autoSwitch
				? Object.assign(state.autoSwitch, {
						enabled: action.payload,
				  })
				: { enabled: action.payload };
			return state;
		});

		reducer.addCase(setACAutoPowerSwitching, (state, action) => {
			let { autoSwitch } = state;
			state.autoSwitch = autoSwitch
				? Object.assign(state.autoSwitch, {
						acPlan: action.payload,
				  })
				: { acPlan: action.payload };
			return state;
		});

		reducer.addCase(setDCAutoPowerSwitching, (state, action) => {
			let { autoSwitch } = state;
			state.autoSwitch = autoSwitch
				? Object.assign(state.autoSwitch, {
						dcPlan: action.payload,
				  })
				: { dcPlan: action.payload };
			return state;
		});

		reducer.addCase(addRyzenadjPlan, (state, action) => {
			let { payload } = action;
			let { ryzenadj } = state;
			console.log(payload);
			state.ryzenadj.options = Object.assign(ryzenadj.options, [
				...ryzenadj.options,
				payload,
			]);
			return state;
		});

		reducer.addCase(removeRyzenadjPlan, (state, action) => {
			let { payload } = action;
			state.ryzenadj.options = state.ryzenadj.options.filter(
				(val) => val.name !== payload.name
			);
			return state;
		});
	});
	return reducer;
};

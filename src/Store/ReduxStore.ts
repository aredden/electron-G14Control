/** @format */

import {
	configureStore,
	createAction,
	createReducer,
	EnhancedStore,
} from '@reduxjs/toolkit';

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
const createRootReducer = (initialState: G14Config) => {
	let reducer = createReducer(initialState, (reducer) => {
		/**
		 * Fan Config Store
		 */
		reducer.addCase(updateLoopTimes, (state, action) => {
			console.log(action, state);
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
			console.log(action, state);
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
			let newState = {
				loopTimes: state.loopTimes,
				fanCurves: state.fanCurves,
				ryzenadj: {
					defaults: {
						tctlTemp: tctlTemp as number,
						slowLimit: slowLimit as number,
						fastLimit: fastLimit as number,
						slowTime: slowTime as number,
						stapmLimit: stapmLimit as number,
						stapmTime: stapmTime as number,
					},
					limits: {},
					options: [],
				},
				displayOptions: state.displayOptions,
			};
			state = newState;
			return state;
		});

		reducer.addCase(updateDisplayOptions, (state, action) => {
			let { payload } = action;
			let { ryzenadj, fanCurves, loopTimes } = state;
			let newState = {
				ryzenadj,
				fanCurves,
				loopTimes,
				displayOptions: payload,
			};
			state = newState;
			return state;
		});
	});
	return reducer;
};

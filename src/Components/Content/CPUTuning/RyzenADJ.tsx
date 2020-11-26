/** @format */

import React, { Component } from 'react';
import { message, Select, Space } from 'antd';
import { store, updateCurrentConfig } from '../../../Store/ReduxStore';
import RyzenForm from './RyzenForm';
interface Props {}

interface State {
	ryzenadjConfig: RyzenadjConfig;
	options: RyzenadjConfigNamed[];
	radjFormItems: RyzenFormItem[];
	radjName: string;
}

type RADJReactConfig = 'tdp' | 'ftdp' | 'stdp' | 'ftime' | 'stime' | 'temp';

type RyzenFormTypes =
	| 'stapmLimit'
	| 'fastLimit'
	| 'slowLimit'
	| 'stapmTime'
	| 'slowTime'
	| 'tctlTemp';

export const radjconfigkey = {
	stapmLimit: 'tdp',
	fastLimit: 'ftdp',
	slowLimit: 'stdp',
	stapmTime: 'stime',
	slowTime: 'ftime',
	tctlTemp: 'temp',
};

let ryzenFormData: Map<RyzenFormTypes, RyzenFormItem> = new Map<
	RyzenFormTypes,
	RyzenFormItem
>([
	[
		'stapmLimit',
		{
			min: 5,
			max: 120,
			caseKey: 'tdp',
			formLabel: 'CPU TDP',
			value: 0,
		},
	],
	[
		'fastLimit',
		{
			min: 5,
			max: 120,
			caseKey: 'ftdp',
			formLabel: 'Fastest Boost TDP',
			value: 0,
		},
	],
	[
		'slowLimit',
		{
			min: 5,
			max: 120,
			caseKey: 'stdp',
			formLabel: 'Post-Boost TDP',
			value: 0,
		},
	],
	[
		'slowTime',
		{
			min: 1,
			max: 120,
			caseKey: 'ftime',
			formLabel: 'Fastest Boost TDP Duration',
			value: 0,
		},
	],
	[
		'stapmTime',
		{
			min: 60,
			max: 3000,
			caseKey: 'stime',
			formLabel: 'Post-Boost TDP Duration',
			value: 0,
		},
	],
	[
		'tctlTemp',
		{
			min: 60,
			max: 101,
			caseKey: 'temp',
			formLabel: 'CPU Temperature Limit',
			value: 0,
		},
	],
]);

export default class RyzenADJ extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let { ryzenadj, current } = store.getState() as G14Config;
		let startPlan = current.ryzenadj;
		let start = ryzenadj.options.find((plan) => {
			return plan.name === startPlan;
		}) as RyzenadjConfigNamed;
		let startRyzenDefaults = Object.assign({}, start);
		this.state = {
			ryzenadjConfig: startRyzenDefaults,
			options: [...ryzenadj.options],
			radjName: startPlan,
			radjFormItems: this.buildRyzenFormItems(startRyzenDefaults),
		};
	}

	onSubmit = async () => {
		let { ryzenadjConfig, radjName } = this.state;
		let state = store.getState() as G14Config;
		message.loading(
			{
				content: 'Applying settings...',
			},
			3
		);
		let result = await window.ipcRenderer.invoke('setRyzenadj', ryzenadjConfig);
		if (result) {
			store.dispatch(
				updateCurrentConfig({
					ryzenadj: radjName,
					fanCurve: state.current.fanCurve,
				})
			);
			//@ts-ignore
			message.success('Successfully applied cpu settings!');
		} else {
			//@ts-ignore
			message.error('Failed to apply cpu settings.');
		}
	};

	modifyStateWithNewValues = (
		newValue: number,
		caseKey: RADJReactConfig,
		radjkey: RyzenFormTypes
	) => {
		let { ryzenadjConfig, radjFormItems } = this.state;
		let newFormItems: RyzenFormItem[] = [];

		let { stapmLimit, fastLimit, slowLimit } = ryzenadjConfig;
		// check for valid ryzenadj configuration
		switch (caseKey) {
			case 'ftdp':
				fastLimit = newValue;
				if (fastLimit < slowLimit) {
					slowLimit = fastLimit;
				}
				if (fastLimit < stapmLimit) {
					stapmLimit = fastLimit;
				}
				break;
			case 'stdp':
				slowLimit = newValue;
				if (slowLimit > fastLimit) {
					fastLimit = slowLimit;
				}
				if (slowLimit < stapmLimit) {
					stapmLimit = slowLimit;
				}
				break;
			case 'tdp':
				stapmLimit = newValue;
				if (stapmLimit > slowLimit) {
					slowLimit = stapmLimit;
				}
				if (stapmLimit > fastLimit) {
					fastLimit = stapmLimit;
				}
				break;
		}

		if (caseKey === 'stdp' || caseKey === 'ftdp' || caseKey === 'tdp') {
			ryzenadjConfig.fastLimit = fastLimit;
			ryzenadjConfig.slowLimit = slowLimit;
			ryzenadjConfig.stapmLimit = stapmLimit;
			newFormItems = radjFormItems.map((val) => {
				if (val.caseKey === 'ftdp') {
					val.value = fastLimit;
				}
				if (val.caseKey === 'stdp') {
					val.value = slowLimit;
				}
				if (val.caseKey === 'tdp') {
					val.value = stapmLimit;
				}
				return val;
			});
		} else {
			ryzenadjConfig[radjkey] = newValue;
			newFormItems = radjFormItems.map((val) => {
				if (val.caseKey === caseKey) {
					val.value = newValue;
				}
				return val;
			});
		}

		this.setState({ ryzenadjConfig, radjFormItems: newFormItems });
	};

	onInputChange = (
		event: string | number | undefined,
		value: RADJReactConfig
	) => {
		switch (value) {
			case 'ftdp':
				this.modifyStateWithNewValues(event as number, value, 'fastLimit');
				break;
			case 'stdp':
				this.modifyStateWithNewValues(event as number, value, 'slowLimit');
				break;
			case 'ftime':
				this.modifyStateWithNewValues(event as number, value, 'slowTime');
				break;
			case 'stime':
				this.modifyStateWithNewValues(event as number, value, 'stapmTime');
				break;
			case 'tdp':
				this.modifyStateWithNewValues(event as number, value, 'stapmLimit');
				break;
			case 'temp':
				this.modifyStateWithNewValues(event as number, value, 'tctlTemp');
				break;
		}
	};

	handleSelectChange = (name: string) => {
		let { options } = this.state;
		let choice = options.find((option) => {
			return option.name === name;
		});
		let newChoice: RyzenadjConfig = Object.assign({}, choice);
		//@ts-ignore
		delete newChoice.name;
		let formItems = this.buildRyzenFormItems(newChoice);

		this.setState({
			ryzenadjConfig: newChoice,
			radjFormItems: formItems,
			radjName: name,
		});
	};

	buildRyzenFormItems = (chosenRADJ: RyzenadjConfig) => {
		let {
			stapmLimit,
			stapmTime,
			slowLimit,
			slowTime,
			fastLimit,
			tctlTemp,
		} = chosenRADJ;
		let newRyzenFormData: RyzenFormItem[] = [];
		newRyzenFormData.push(
			Object.assign(ryzenFormData.get('fastLimit'), { value: fastLimit })
		);
		newRyzenFormData.push(
			Object.assign(ryzenFormData.get('slowLimit'), { value: slowLimit })
		);
		newRyzenFormData.push(
			Object.assign(ryzenFormData.get('stapmLimit'), { value: stapmLimit })
		);
		newRyzenFormData.push(
			Object.assign(ryzenFormData.get('slowTime'), { value: slowTime })
		);
		newRyzenFormData.push(
			Object.assign(ryzenFormData.get('stapmTime'), { value: stapmTime })
		);
		newRyzenFormData.push(
			Object.assign(ryzenFormData.get('tctlTemp'), { value: tctlTemp })
		);
		return newRyzenFormData;
	};

	componentDidMount() {
		this.buildRyzenFormItems(this.state.ryzenadjConfig);
	}

	render() {
		let { options, radjFormItems, radjName } = this.state;

		return (
			<>
				<div
					style={{
						position: 'absolute',
						right: '55px',
						width: '300px',
						height: '260px',
						top: '199px',
						backgroundColor: '#F0F2F5',
						padding: '.5rem 1rem 1rem 1rem',
					}}>
					{' '}
					<Space direction="vertical">
						<h4 style={{ margin: '.4rem' }}>CPU Presets:</h4>
						<Select
							defaultValue={radjName}
							style={{
								marginLeft: '.4rem',
								width: 120,
							}}
							onSelect={this.handleSelectChange}>
							{options.map((val, idx) => {
								return (
									<Select.Option key={'selectRADJ' + idx} value={val.name}>
										{val.name}
									</Select.Option>
								);
							})}
						</Select>
						<div style={{ marginLeft: '.4rem' }}>
							Ryzenadj settings will occasionally take several tries before
							being successfully applied.
						</div>
					</Space>
				</div>
				<RyzenForm
					submit={this.onSubmit}
					formItems={radjFormItems}
					onInputChange={this.onInputChange}
				/>
			</>
		);
	}
}

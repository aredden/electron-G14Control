/** @format */

import React, { Component } from 'react';
import { message, Select } from 'antd';
import { store } from '../../../Store/ReduxStore';
import RyzenForm from './RyzenForm';
interface Props {}

interface State {
	ryzenadjConfig: RyzenadjConfig;
	options: RyzenadjConfigNamed[];
	radjFormTimes: RyzenFormItem[];
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
			min: 3,
			max: 120,
			caseKey: 'tdp',
			formLabel: 'CPU TDP',
			value: 0,
		},
	],
	[
		'fastLimit',
		{
			min: 3,
			max: 120,
			caseKey: 'ftdp',
			formLabel: 'Fastest Boost TDP',
			value: 0,
		},
	],
	[
		'slowLimit',
		{
			min: 3,
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
			max: 30,
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
			max: 97,
			caseKey: 'temp',
			formLabel: 'CPU Temperature Limit',
			value: 0,
		},
	],
]);

export default class RyzenADJ extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let { defaults, options } = (store.getState() as G14Config).ryzenadj;
		let startRyzenDefaults = Object.assign({}, defaults);
		this.state = {
			ryzenadjConfig: startRyzenDefaults,
			options: [...options],
			radjFormTimes: this.buildRyzenFormItems(startRyzenDefaults),
		};
	}

	onSubmit = async () => {
		let { ryzenadjConfig } = this.state;
		message.loading(
			{
				content: 'Applying settings...',
			},
			3
		);
		let result = await window.ipcRenderer.invoke('setRyzenadj', ryzenadjConfig);
		if (result) {
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
		let { ryzenadjConfig, radjFormTimes } = this.state;
		let newFormItems: RyzenFormItem[] = [];
		ryzenadjConfig[radjkey] = newValue;
		newFormItems = radjFormTimes.map((val) => {
			if (val.caseKey === caseKey) {
				val.value = newValue;
			}
			return val;
		});
		this.setState({ ryzenadjConfig, radjFormTimes: newFormItems });
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
			radjFormTimes: formItems,
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
		let { options, radjFormTimes } = this.state;
		// let {
		// 	stapmLimit,
		// 	stapmTime,
		// 	slowLimit,
		// 	slowTime,
		// 	fastLimit,
		// 	tctlTemp,
		// } = ryzenadjConfig;

		return (
			<>
				<Select
					defaultValue="default"
					style={{ width: 120 }}
					onSelect={this.handleSelectChange}>
					{options.map((val, idx) => {
						return (
							<Select.Option key={'selectRADJ' + idx} value={val.name}>
								{val.name}
							</Select.Option>
						);
					})}
				</Select>
				<RyzenForm
					submit={this.onSubmit}
					formItems={radjFormTimes}
					onInputChange={this.onInputChange}
				/>
			</>
		);
	}
}

/** @format */

import React, { Component } from 'react';
import { Button, Form, InputNumber, PageHeader, message, Select } from 'antd';
import { store } from '../../Store/ReduxStore';
// import RyzenadjConfig from '../../react-app-env';
interface Props {}

interface State {
	ryzenadjConfig: RyzenadjConfig;
	options: RyzenadjConfigNamed[];
}

type RADJReactConfig = 'tdp' | 'ftdp' | 'stdp' | 'ftime' | 'stime' | 'temp';

export default class RyzenADJ extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let { defaults, options } = (store.getState() as G14Config).ryzenadj;
		this.state = {
			ryzenadjConfig: {
				fastLimit: defaults.fastLimit,
				slowLimit: defaults.slowLimit,
				stapmLimit: defaults.stapmLimit,
				stapmTime: defaults.stapmTime,
				slowTime: defaults.slowTime,
				tctlTemp: defaults.tctlTemp,
			},
			options: [...options],
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

	onInputChange = (
		event: string | number | undefined,
		value: RADJReactConfig
	) => {
		console.log(event);
		let { ryzenadjConfig } = this.state;
		switch (value) {
			case 'ftdp':
				ryzenadjConfig['fastLimit'] = event as number;
				this.setState({ ryzenadjConfig });
				break;
			case 'stdp':
				ryzenadjConfig['slowLimit'] = event as number;
				this.setState({ ryzenadjConfig });
				break;
			case 'ftime':
				ryzenadjConfig['stapmTime'] = event as number;
				this.setState({ ryzenadjConfig });
				break;
			case 'stime':
				ryzenadjConfig['slowTime'] = event as number;
				this.setState({ ryzenadjConfig });
				break;
			case 'tdp':
				ryzenadjConfig['stapmLimit'] = event as number;
				this.setState({ ryzenadjConfig });
				break;
			case 'temp':
				ryzenadjConfig['tctlTemp'] = event as number;
				this.setState({ ryzenadjConfig });
				break;
		}
	};

	handleSelectChange = (name: string) => {
		let { options } = this.state;
		let choice = options.find((option) => {
			return option.name === name;
		});
		let {
			stapmLimit,
			stapmTime,
			slowLimit,
			slowTime,
			fastLimit,
			tctlTemp,
		} = choice as RyzenadjConfigNamed;
		this.setState({
			ryzenadjConfig: {
				stapmLimit,
				stapmTime,
				slowLimit,
				slowTime,
				fastLimit,
				tctlTemp,
			},
		});
	};

	render() {
		let { ryzenadjConfig, options } = this.state;
		let {
			stapmLimit,
			stapmTime,
			slowLimit,
			slowTime,
			fastLimit,
			tctlTemp,
		} = ryzenadjConfig;

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
				<Form
					title="Ryzenadj CPU Tuning"
					labelCol={{ span: 10 }}
					wrapperCol={{ span: 24 }}
					layout="horizontal">
					<Form.Item>
						<PageHeader title="RyzenADJ CPU Tuning">
							Modify CPU performance limits.
						</PageHeader>
					</Form.Item>
					<Form.Item label="CPU TDP">
						<InputNumber
							min={10}
							max={90}
							formatter={(val) => val?.toString().replace(/w|\D/gm, '') + 'w'}
							value={stapmLimit}
							defaultValue={stapmLimit}
							onChange={(e) => this.onInputChange(e, 'tdp')}
						/>
					</Form.Item>
					<Form.Item label="Fastest Boost TDP">
						<InputNumber
							min={10}
							max={90}
							formatter={(val) => val?.toString().replace(/w|\D/gm, '') + 'w'}
							value={fastLimit}
							defaultValue={fastLimit}
							onChange={(e) => this.onInputChange(e, 'ftdp')}
						/>
					</Form.Item>
					<Form.Item label="Post-Boost TDP">
						<InputNumber
							min={10}
							max={90}
							formatter={(val) => val?.toString().replace(/w|\D/gm, '') + 'w'}
							value={slowLimit}
							defaultValue={slowLimit}
							onChange={(e) => this.onInputChange(e, 'stdp')}
						/>
					</Form.Item>
					<Form.Item label="Post-Boost TDP Time">
						<InputNumber
							min={10}
							max={900}
							formatter={(val) => val?.toString().replace(/s|\D/gm, '') + 's'}
							value={stapmTime}
							defaultValue={stapmTime}
							onChange={(e) => this.onInputChange(e, 'ftime')}
						/>
					</Form.Item>
					<Form.Item label="Fastest Boost TDP Time">
						<InputNumber
							min={1}
							max={120}
							formatter={(val) => val?.toString().replace(/s|\D/gm, '') + 's'}
							value={slowTime}
							defaultValue={slowTime}
							onChange={(e) => this.onInputChange(e, 'stime')}
						/>
					</Form.Item>
					<Form.Item label="CPU Temperature Limit">
						<InputNumber
							min={20}
							max={105}
							formatter={(val) => val?.toString().replace(/c|\D/gm, '') + 'c'}
							value={tctlTemp}
							defaultValue={tctlTemp}
							onChange={(e) => this.onInputChange(e, 'temp')}
						/>
					</Form.Item>
					<Form.Item>
						<Button onClick={this.onSubmit}>Submit</Button>
					</Form.Item>
				</Form>
			</>
		);
	}
}

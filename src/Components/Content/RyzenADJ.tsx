/** @format */

import React, { Component } from 'react';
import { Button, Form, InputNumber, PageHeader } from 'antd';
// import RyzenadjConfig from '../../react-app-env';
interface Props {}

interface State {
	ryzenadjConfig: RyzenadjConfig;
}

type RADJReactConfig = 'tdp' | 'ftdp' | 'stdp' | 'ftime' | 'stime' | 'temp';

export default class RyzenADJ extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			ryzenadjConfig: {
				fastLimit: 65000,
				slowLimit: 54000,
				stapmLimit: 35000,
				stapmTime: 2,
				slowTime: 30,
				tctlTemp: 95,
			},
		};
	}

	adjResultListener = (result: false | RyzenadjConfig) => {
		if (result) {
			alert('Successfully set ryzenadj configuration settings!');
		} else {
			alert('Failed to set ryzenadj configuration settings.');
		}
	};

	componentDidMount() {
		window.ipcRenderer.on('setRyzenadjResult', this.adjResultListener);
	}

	componentWillUnmount() {
		window.ipcRenderer.off('setRyzenadjResult', this.adjResultListener);
	}

	onSubmit = () => {
		let { ryzenadjConfig } = this.state;
		window.ipcRenderer.send('setRyzenadj', ryzenadjConfig);
	};

	onInputChange = (
		event: string | number | undefined,
		value: RADJReactConfig
	) => {
		console.log(event);
		let { ryzenadjConfig } = this.state;
		switch (value) {
			case 'ftdp':
				ryzenadjConfig['fastLimit'] = (event as number) * 1000;
				this.setState({ ryzenadjConfig });
				break;
			case 'stdp':
				ryzenadjConfig['slowLimit'] = (event as number) * 1000;
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
				ryzenadjConfig['stapmLimit'] = (event as number) * 1000;
				this.setState({ ryzenadjConfig });
				break;
			case 'temp':
				ryzenadjConfig['tctlTemp'] = event as number;
				this.setState({ ryzenadjConfig });
				break;
		}
	};

	render() {
		return (
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
						formatter={(val) => val + 'w'}
						defaultValue={35}
						onChange={(e) => this.onInputChange(e, 'tdp')}
					/>
				</Form.Item>
				<Form.Item label="Fastest Boost TDP">
					<InputNumber
						min={10}
						max={90}
						formatter={(val) => val + 'w'}
						defaultValue={54}
						onChange={(e) => this.onInputChange(e, 'ftdp')}
					/>
				</Form.Item>
				<Form.Item label="Post-Boost TDP">
					<InputNumber
						min={10}
						max={90}
						formatter={(val) => val + 'w'}
						defaultValue={45}
						onChange={(e) => this.onInputChange(e, 'stdp')}
					/>
				</Form.Item>
				<Form.Item label="Fastest Boost TDP Time">
					<InputNumber
						min={1}
						max={900}
						formatter={(val) => val + 's'}
						defaultValue={100}
						onChange={(e) => this.onInputChange(e, 'ftime')}
					/>
				</Form.Item>
				<Form.Item label="Post-Boost TDP Time">
					<InputNumber
						min={1}
						max={900}
						formatter={(val) => val + 's'}
						defaultValue={20}
						onChange={(e) => this.onInputChange(e, 'stime')}
					/>
				</Form.Item>
				<Form.Item label="CPU Temperature Limit">
					<InputNumber
						min={20}
						max={105}
						formatter={(val) => val + 'c'}
						defaultValue={95}
						onChange={(e) => this.onInputChange(e, 'temp')}
					/>
				</Form.Item>
				<Form.Item>
					<Button onClick={this.onSubmit}>Submit</Button>
				</Form.Item>
			</Form>
		);
	}
}

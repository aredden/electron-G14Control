/** @format */

import { Card, Descriptions, Space, Switch } from 'antd';
import React, { Component } from 'react';

interface Props {}
interface State {
	smuData: SMUData[];
	listening: boolean;
}

export default class MonitoringList extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			smuData: [],
			listening: false,
		};
	}

	initMonitor = () => {
		let { listening } = this.state;
		if (!listening) {
			window.ipcRenderer.send('initMonitor');
			window.ipcRenderer.on('smuData', this.smuDataListener);
			this.setState({ listening: true });
		}
	};

	smuDataListener = (_evt: any, data: SMUData[]) => {
		if(data instanceof Array){
			this.setState({ smuData: data });
		}
	};

	handleListen = (_evt: any) => {
		let { listening } = this.state;
		if (listening) {
			window.ipcRenderer.send('killMonitor');
			window.ipcRenderer.off('smuData', this.smuDataListener);
			this.setState({ listening: false });
		} else {
			window.ipcRenderer.send('initMonitor');
			window.ipcRenderer.on('smuData', this.smuDataListener);
			this.setState({ listening: true });
		}
	};

	componentWillUnmount() {
		let { listening } = this.state;

		if (listening) {
			window.ipcRenderer.send('killMonitor');
			window.ipcRenderer.off('smuData', this.smuDataListener);
		}
	}

	render() {
		let { listening, smuData } = this.state;
		return (
			<>
				<Card title={'SMU Monitoring'}>
					<Space direction="horizontal">
						<label>Monitoring Enabled</label>
						<Switch checked={listening} onClick={this.handleListen}></Switch>
					</Space>
					<hr></hr>
					<Descriptions>
						{smuData.map((dat) => {
							return (
								<Descriptions.Item label={dat.description}>
									{dat.value}
								</Descriptions.Item>
							);
						})}
					</Descriptions>
				</Card>
			</>
		);
	}
}

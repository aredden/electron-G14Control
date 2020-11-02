/** @format */

import { Statistic } from 'antd';
import React, { Component } from 'react';
import './TempView.scss';
interface Props {}

interface State {
	temperature: number;
}

export default class TempView extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			temperature: 0,
		};
	}

	componentDidMount() {
		window.ipcRenderer.send('cpuTempRun', true);
		window.ipcRenderer.on('cpuTemperature', this.tempListener);
	}

	tempListener = (event: any, result: number) => {
		this.setState({ temperature: result });
	};

	componentWillUnmount() {
		window.ipcRenderer.send('cpuTempRun', false);
		window.ipcRenderer.off('cpuTemperature', this.tempListener);
	}

	render() {
		let { temperature } = this.state;
		return (
			<div className="tempView">
				<Statistic
					className="flex-center"
					title="CPU Temp"
					value={temperature}
					precision={2}
					style={{ color: 'white' }}
					suffix="C"
				/>
			</div>
		);
	}
}

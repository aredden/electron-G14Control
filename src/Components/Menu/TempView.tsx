/** @format */

import { Card, Statistic } from 'antd';
import React, { Component } from 'react';
import { CiCircleOutlined } from '@ant-design/icons';
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
		window.ipcRenderer.on('cpuTemperature', this.tempListener);
	}

	tempListener = (event: any, result: number) => {
		console.log(result);

		this.setState({ temperature: result });
	};

	componentWillUnmount() {
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
					valueStyle={{ color: 'green' }}
					suffix="C"
				/>
			</div>
		);
	}
}

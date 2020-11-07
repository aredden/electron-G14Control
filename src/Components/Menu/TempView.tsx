/** @format */

import { Statistic } from 'antd';
import React, { Component } from 'react';
import './TempView.scss';
interface Props {}

interface State {
	temperature: number;
	tempContent: HTMLDivElement | undefined;
}

export default class TempView extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			temperature: 0,
			tempContent: undefined,
		};
	}

	componentDidMount() {
		window.ipcRenderer.send('cpuTempRun', true);
		window.ipcRenderer.on('cpuTemperature', this.tempListener);
	}

	tempListener = (event: any, result: number) => {
		if (!this.state.tempContent) {
			let elem = document.getElementsByClassName(
				'ant-statistic-content'
			)[0] as HTMLDivElement;
			this.setState({ tempContent: elem }, () => {
				this.tempListener(undefined, result);
			});
			return;
		}
		let { tempContent: elem } = this.state;
		if (result) {
			if (result < 40) {
				elem.style.color = '#89C379';
			} else if (result < 65) {
				elem.style.color = '#E5A153';
			} else {
				elem.style.color = '#FF4D4D';
			}
		}
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

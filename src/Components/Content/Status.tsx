/** @format */

import { Progress } from 'antd';
import React, { Component } from 'react';
import './Status.scss';

interface Props {}

interface State {
	loadValues: Array<{ Name: string; PercentProcessorTime: number }>;
}

export default class Status extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			loadValues: [],
		};
	}

	coreLoadListener = (
		event: any,
		loadvalues: Array<{ Name: string; PercentProcessorTime: number }>
	) => {
		this.setState({ loadValues: loadvalues });
	};

	componentDidMount() {
		window.ipcRenderer.send('cpuLoadRun', true);

		window.ipcRenderer.on('coresLoad', this.coreLoadListener);
	}

	componentWillUnmount() {
		window.ipcRenderer.send('cpuLoadRun', false);
		window.ipcRenderer.off('coresLoad', this.coreLoadListener);
	}

	render() {
		let { loadValues } = this.state;
		loadValues = loadValues.sort((a, b) => {
			return parseFloat(a.Name) - parseFloat(b.Name);
		});
		return (
			<div>
				<div>
					{loadValues.map((value) => {
						return (
							<div className="cpu-load-figure">
								{`CPU ${value.Name}`}
								<Progress percent={value.PercentProcessorTime} />
							</div>
						);
					})}
				</div>
			</div>
		);
	}
}

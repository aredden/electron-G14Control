/** @format */

import { Progress } from 'antd';
import Chart from 'chart.js';
import React, { Component } from 'react';
import './Status.scss';

interface Props {}

interface State {
	chart: any;
	loadValues: Array<{ Name: string; PercentProcessorTime: number }>;
}

export default class Status extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			loadValues: [],
			chart: undefined,
		};
	}

	coreLoadListener = (
		event: any,
		loadvalues: Array<{ Name: string; PercentProcessorTime: number }>
	) => {
		let { chart } = this.state;
		(chart as Chart).data.datasets?.forEach((value, idx) => {
			//@ts-ignore
			value.data.push(loadvalues[idx].PercentProcessorTime);
			chart.data.datasets[idx] = value;
		});
		chart.update();
		this.setState({ loadValues: loadvalues });
	};

	componentDidMount() {
		let chart = new Chart(
			document.getElementById('statusChart') as HTMLCanvasElement,
			{
				type: 'line',
				data: {
					datasets: [
						...this.state.loadValues.map((value) => {
							return {
								label: value.Name,
								color: 'blue',
								data: [value.PercentProcessorTime],
							};
						}),
					],
				},
				options: {
					scales: {
						xAxes: [
							{
								ticks: {
									suggestedMin: 0,
									suggestedMax: 100,
								},
							},
						],
						yAxes: [
							{
								ticks: {
									suggestedMin: 0,
									suggestedMax: 100,
								},
							},
						],
					},
				},
			}
		);
		window.ipcRenderer.send('cpuLoadRun', true);

		window.ipcRenderer.on('coresLoad', this.coreLoadListener);
		this.setState({ chart });
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
					<canvas id="statusChart"></canvas>
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

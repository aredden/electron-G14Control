/** @format */

import React, { Component } from 'react';
import cjs, { Chart } from 'chart.js';
import * as dragData from 'chartjs-plugin-dragdata';
import { createChart } from './FanCurve/options';
import { Button, PageHeader } from 'antd';
import _ from 'lodash';
interface Props {}

interface State {
	chart: cjs | undefined;
	currentCurves: {
		cpu: Array<number>;
		gpu: Array<number>;
	};
	fanCurves: Map<string, Array<number>>;
	charts: {
		cpu: Chart | undefined;
		gpu: Chart | undefined;
	};
}

export default class FanCurve extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			chart: undefined,
			currentCurves: {
				cpu: [0, 0, 0, 0, 31, 49, 56, 56],
				gpu: [0, 0, 0, 0, 34, 51, 61, 61],
			},
			charts: {
				cpu: undefined,
				gpu: undefined,
			},
			fanCurves: new Map<string, Array<number>>(),
		};
	}

	handleMapModify = (key: string, index: number, value: number) => {
		if (key === 'fanCurveChartCPU') {
			console.log(key, index, value);
			let { gpu, cpu } = this.state.currentCurves;
			cpu[index] = value;
			this.setState({
				currentCurves: {
					cpu,
					gpu,
				},
			});
		} else if (key === 'fanCurveChartGPU') {
			let { gpu, cpu } = this.state.currentCurves;
			gpu[index] = value;
			this.setState({
				currentCurves: {
					cpu,
					gpu,
				},
			});
		}
	};

	handleSubmitCurves = async (e: any) => {
		let result = await window.ipcRenderer.invoke(
			'setFanCurve',
			this.state.currentCurves
		);
	};

	componentDidMount() {
		//Testing fan curve data
		let { cpu, gpu } = this.state.currentCurves;
		Chart.pluginService.register(dragData);
		let cpuChart = createChart('fanCurveChartCPU', this.handleMapModify, cpu);
		let gpuChart = createChart('fanCurveChartGPU', this.handleMapModify, gpu);
		this.setState({
			charts: {
				cpu: cpuChart,
				gpu: gpuChart,
			},
		});
	}

	componentWillUnmount() {
		Chart.pluginService.unregister(dragData);
	}

	render() {
		return (
			<div>
				<PageHeader title="Fan Curve Editor">
					Modify fan speed configuration.
				</PageHeader>
				<canvas id="fanCurveChartCPU" className="Charto"></canvas>
				<canvas id="fanCurveChartGPU" className="Charto"></canvas>
				<Button onClick={(e) => this.handleSubmitCurves(e)}>Submit</Button>
			</div>
		);
	}
}

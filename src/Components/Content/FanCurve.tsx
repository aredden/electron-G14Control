/** @format */

import React, { Component } from 'react';
import cjs, { Chart } from 'chart.js';
import * as dragData from 'chartjs-plugin-dragdata';
import { createChart } from './FanCurve/options';
import { PageHeader } from 'antd';
interface Props {}

interface State {
	chart: cjs | undefined;
	fanCurves: Map<string, Array<number>>;
}

export default class FanCurve extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			chart: undefined,
			fanCurves: new Map<string, Array<number>>(),
		};
	}

	handleMapModify(key: string, index: number, value: number) {}

	componentDidMount() {
		//Testing fan curve data
		let map = new Map<string, Array<number>>();
		map = map.set('default', [0, 0, 10, 15, 25, 35, 55, 55]);
		Chart.pluginService.register(dragData);
		createChart('fanCurveChart', this.handleMapModify, map);
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
				<canvas id="fanCurveChart" className="Charto"></canvas>
			</div>
		);
	}
}

/** @format */

import React, { Component } from 'react';
import cjs, { Chart } from 'chart.js';
import * as dragData from 'chartjs-plugin-dragdata';
import { createChart } from './FanCurve/options';
import { PageHeader } from 'antd';
interface Props {}

interface State {
	chart: cjs | undefined;
}

export default class FanCurve extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			chart: undefined,
		};
	}

	componentDidMount() {
		Chart.pluginService.register(dragData);
		createChart('fanCurveChart');
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

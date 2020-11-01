/** @format */

import React, { Component } from 'react';
import cjs, { Chart, ChartConfiguration } from 'chart.js';
import * as anno from 'chartjs-plugin-annotation';
import * as cdraggable from 'chartjs-plugin-draggable';
import * as dragData from 'chartjs-plugin-dragdata';
import { createChart } from './FanCurve/options';
interface Props {}

interface State {
	chart: cjs | undefined;
}

const data: cjs.ChartData = {
	labels: [
		'0%',
		'10%',
		'20%',
		'30%',
		'40%',
		'50%',
		'60%',
		'70%',
		'80%',
		'90%',
		'100%',
	],
	datasets: [
		{
			label: 'Fan Curve',
			data: [33, 53, 85, 41, 44, 65, 0, 0, 0, 0, 0],
			fill: true,
			backgroundColor: 'rgba(75,192,192,0.2)',
			borderColor: 'rgba(75,192,192,1)',
		},
		{
			label: 'New Fan Curve',
			data: [33, 35, 45, 49, 65, 65, 65, 65, 65, 65, 65],
			fill: false,
			borderColor: '#742774',
		},
	],
};

let horizHeight = 25;

const options: cjs.ChartOptions = {
	scales: {
		yAxes: [
			{
				ticks: {
					suggestedMin: 0,
					suggestedMax: 100,
				},
			},
		],
	},
	//@ts-ignore

	annotation: {
		drawTime: 'afterDraw',
		annotations: [
			{
				type: 'box',
				xScaleID: 'x-axis-0',
				yScaleID: 'y-axis-0',
				yMin: 0,
				yMax: 15,
				xMin: 30,
				xMax: 50,
				borderWidth: 1,
				backgroundColor: 'rgba(200,60,60,0.25)',
				borderColor: 'rgba(200,60,60,0.25)',
			},
			{
				type: 'box',
				xScaleID: 'x-axis-0',
				yScaleID: 'y-axis-0',
				yMin: 30,
				yMax: 40,
				xMin: 0,
				xMax: 100,
				borderWidth: 1,
				backgroundColor: 'rgba(60,60,200,0.25)',
				borderColor: 'rgba(60,60,200,0.25)',
			},
			{
				type: 'line',
				mode: 'horizontal',
				scaleID: 'y-axis-0',
				value: horizHeight,
				//@ts-ignore
				draggable: true,
				onDrag: function (event: any) {
					event.subject.chart.options.annotation.annotations[2].value =
						event.subject.config.value;
					event.subject.chart.update();
				},
			},
		],
	},
};

export default class FanCurve extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			chart: undefined,
		};
	}

	componentDidMount() {
		// let namedChartAnnotation = anno;
		// namedChartAnnotation['id'] = 'annotation';
		Chart.pluginService.register(dragData);
		createChart('fanCurveChart');
		// Chart.pluginService.register(namedChartAnnotation);
		// Chart.pluginService.register(cdraggable);
		// let config: ChartConfiguration = {
		// 	data: data,
		// 	type: 'line',
		// 	options: options,
		// };

		// // get canvas element
		// let elem: HTMLCanvasElement = document.getElementById(
		// 	'fanCurveChart'
		// ) as HTMLCanvasElement;

		// // build final chart.
		// let ctx = elem.getContext('2d') as CanvasRenderingContext2D;
		// let chart = new Chart(ctx, config);
		// this.setState({ chart: chart });
	}

	render() {
		return <canvas id="fanCurveChart" className="Charto"></canvas>;
	}
}

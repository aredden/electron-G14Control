/** @format */

import { ChartConfiguration } from 'chart.js';
import 'chartjs-plugin-dragdata';
import { Chart } from 'chart.js';

const buildConfiguration = (
	values: number[],
	onChange: (key: string, index: number, val: number) => any,
	chartId: string
) => {
	const chartConfig: ChartConfiguration = {
		type: 'line', // or radar, bar, horizontalBar, bubble
		data: {
			datasets: [
				{
					label:
						chartId === 'fanCurveChartCPU' ? 'CPU Fan Curve' : 'GPU Fan Curve',
					data: values,
					fill: false,
					pointHitRadius: 30,
					borderColor: 'red',
				},
			],
		},
		options: {
			// the rest of your chart options, e.g. axis configuration
			scales: {
				yAxes: [
					{
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
						ticks: {
							suggestedMin: 0,
							suggestedMax: 100,
						},
					},
				],
				xAxes: [
					{
						labels: ['30c', '40c', '50c', '60c', '70c', '80c', '90c', '100c'],

						ticks: {
							suggestedMin: 30,
							suggestedMax: 100,
						},
					},
				],
			},
			elements: {
				line: {
					tension: 0.1,
				},
			},
			//@ts-ignore

			dragData: true,
			dragX: false,
			dragDataRound: 0, // round to full integers (0 decimals)
			dragOptions: {
				// magnet: { // enable to stop dragging after a certain value
				//   to: Math.round
				// },
				showTooltip: true, // Recommended. This will show the tooltip while the user
				// drags the datapoint
			},
			onDragStart: function (e: any, element: any) {
				// where e = event
			},
			onDrag: function (
				e: { target: { style: { cursor: string } } },
				datasetIndex: any,
				index: any,
				value: any
			) {
				// change cursor style to grabbing during drag action
				e.target.style.cursor = 'grabbing';
				// where e = event
			},
			onDragEnd: function (
				e: { target: { style: { cursor: string } } },
				datasetIndex: number,
				index: any,
				value: any
			) {
				// restore default cursor style upon drag release
				e.target.style.cursor = 'default';
				onChange(chartId, index, value);
				// where e = event
			},
			hover: {
				onHover: function (e: any) {
					// indicate that a datapoint is draggable by showing the 'grab' cursor when hovered
					//@ts-ignore
					const point = this.getElementAtEvent(e);

					if (point.length) e.target.style.cursor = 'grab';
					else e.target.style.cursor = 'default';
				},
			},
		},
	};
	return chartConfig;
};

export const createChart = (
	chartId: string,
	listener: (x: any, y: any, z: any) => any,
	chartData: number[]
) => {
	const ctx = document.getElementById(chartId) as HTMLCanvasElement;
	const options = buildConfiguration(chartData, listener, chartId);
	const chart = new Chart(ctx, {
		...options,
	});
	return chart;
};

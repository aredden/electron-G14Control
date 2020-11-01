/** @format */

import { ChartConfiguration } from 'chart.js';
import 'chartjs-plugin-dragdata';
import { Chart } from 'chart.js';

const buildConfiguration = () => {
	const chartConfig: ChartConfiguration = {
		type: 'line', // or radar, bar, horizontalBar, bubble
		data: {
			datasets: [
				{
					label: 'Fan Curve',
					data: [33, 53, 85, 41, 44, 65, 0, 0, 0, 0, 0],
					fill: false,
					backgroundColor: 'rgba(75,192,192,0.2)',
					borderColor: 'rgba(75,192,192,1)',
					pointHitRadius: 25,
				},
				{
					label: 'New Fan Curve',
					data: [33, 35, 45, 49, 65, 65, 65, 65, 65, 65, 65],
					fill: false,
					borderColor: '#742774',
					pointHitRadius: 25,
				},
			],
		},
		options: {
			// the rest of your chart options, e.g. axis configuration
			scales: {
				yAxes: [
					{
						labels: [
							'0c',
							'10c',
							'20c',
							'30c',
							'40c',
							'50c',
							'60c',
							'70c',
							'80c',
							'90c',
							'100c',
						],
						ticks: {
							suggestedMin: 0,
							suggestedMax: 100,
						},
					},
				],
				xAxes: [
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
				datasetIndex: any,
				index: any,
				value: any
			) {
				// restore default cursor style upon drag release
				e.target.style.cursor = 'default';
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
	chartData?: { type: any; data: any; options: any }
) => {
	const ctx = document.getElementById(chartId) as HTMLCanvasElement;
	const options = buildConfiguration();
	const chart = new Chart(ctx, {
		...options,
	});
	return chart;
};

/** @format */

import { message, Table } from 'antd';
import { isNull, capitalize } from 'lodash';
import React, { Component } from 'react';
import { store } from '../../../Store/ReduxStore';

interface Props {}

interface State {
	fanCurve: { name: string; type: 'Custom' | 'Armoury' };
	ryzenadj: string;
	boost: { ac: number; dc: number };
	needsUpdate: boolean;
	windowsPlan: { name: string; guid: string };
	graphics: { ac: number; dc: number };
	plugged: boolean;
	armoury: string;
}

const dynamicGraphicsOptions = [
	'Force power-saving graphics',
	'Optimize power savings',
	'Optimize performance',
	'Maximize performance',
];

const boostModeOptions = [
	'Disabled',
	'',
	'Aggressive',
	'',
	'Efficient Aggressive',
];

export default class CurrentConfiguration extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let { current, armouryPlan } = store.getState() as G14Config;

		this.state = {
			needsUpdate: false,
			ryzenadj: current.ryzenadj,
			fanCurve: current.fanCurve,
			armoury: armouryPlan,
			plugged: true,
			boost: {
				ac: 0,
				dc: 0,
			},
			windowsPlan: {
				name: '',
				guid: '',
			},
			graphics: {
				ac: 0,
				dc: 0,
			},
		};
	}

	componentDidMount() {
		let { windowsPlan } = this.state;
		window.ipcRenderer
			.invoke('getActivePlan')
			.then((result: { name: string; guid: string } | false) => {
				if (result) {
					windowsPlan = result;
					window.ipcRenderer
						.invoke('getBoost', windowsPlan.guid)
						.then(
							async (
								resultboost:
									| { guid: string; boost: { ac: number; dc: number } }
									| false
							) => {
								if (resultboost && !isNull(resultboost.boost.ac)) {
									if (result) {
										this.setState({ windowsPlan, boost: resultboost.boost });
									} else {
										this.setState({ windowsPlan });
									}
								} else {
									this.setState({ windowsPlan });
									message.error(
										"Couldn't load current boost for active Windows power plan."
									);
								}
							}
						);
				} else {
					message.error("Couldn't load current Windows power plan.");
				}
			});
		window.ipcRenderer.invoke('getSwitchableDynamicGraphics').then(
			(
				response:
					| {
							plan: { name: string; guid: string };
							result: { ac: number; dc: number };
					  }
					| false
			) => {
				if (response) {
					this.setState({ graphics: response.result });
				} else {
					message.error(
						'There was trouble finding switchable dynamic graphics settings.'
					);
				}
			}
		);
		window.ipcRenderer.invoke('isPlugged').then(
			(
				plugType:
					| false
					| {
							ac: boolean;
							dc: boolean;
							usb: boolean;
					  }
			) => {
				if (plugType) {
					let { ac, usb } = plugType;
					this.setState({ plugged: ac || usb });
				} else {
					this.setState({ plugged: true });
				}
			}
		);
	}

	render() {
		let tableColumns = [
			{
				dataIndex: 'name',
				title: 'Setting Type',
			},
			{
				dataIndex: 'value',
				title: 'Chosen Setting',
			},
		];
		let {
			ryzenadj,
			fanCurve,
			boost,
			windowsPlan,
			graphics,
			plugged,
		} = this.state;
		return (
			<>
				<Table
					size="small"
					showHeader
					columns={tableColumns}
					pagination={false}
					bordered
					dataSource={[
						{ name: 'CPU Tuning', value: ryzenadj },
						{
							name: 'Fan Curve',
							value:
								fanCurve.type === 'Custom'
									? `Custom: ${fanCurve.name}`
									: `Armoury: ${capitalize(this.state.armoury)}`,
						},
						{ name: 'Windows Power Plan', value: windowsPlan.name },
						{
							name: 'Boost Mode',
							value: plugged
								? boostModeOptions[boost.ac]
								: boostModeOptions[boost.dc],
						},
						{
							name: 'Graphics Preference',
							value: plugged
								? dynamicGraphicsOptions[graphics.ac]
								: dynamicGraphicsOptions[graphics.dc],
						},
						{
							name: 'Power Delivery',
							value: plugged ? 'Charger' : 'Battery',
						},
					]}></Table>
			</>
		);
	}
}

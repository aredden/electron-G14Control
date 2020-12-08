/** @format */

import { Button, Descriptions, message, Space } from 'antd';
import React, { Component } from 'react';
import { store } from '../../Store/ReduxStore';
import { capitalize } from 'lodash';
interface Props {}
interface State {
	plans: G14ControlPlan[];
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
	'',
	'',
];

const ControlPlan = (props: {
	plan: G14ControlPlan;
	apply: (event: any, plan: G14ControlPlan) => void;
}) => {
	let {
		fanCurve,
		ryzenadj,
		armouryCrate,
		boost,
		graphics,
		windowsPlan,
		name,
	} = props.plan;
	let { apply } = props;
	return (
		<div>
			<Descriptions title={name} bordered>
				<Descriptions.Item span={2} label={'Windows Plan'}>
					{windowsPlan.name}
				</Descriptions.Item>
				<Descriptions.Item span={2} label={'Fan Curve'}>
					{fanCurve}
				</Descriptions.Item>
				<Descriptions.Item span={2} label={'Ryzenadj Config'}>
					{ryzenadj}
				</Descriptions.Item>
				<Descriptions.Item span={2} label={'Armoury Crate'}>
					{capitalize(armouryCrate)}
				</Descriptions.Item>
				<Descriptions.Item span={2} label={'CPU Boost'}>
					{boostModeOptions[boost]}
				</Descriptions.Item>
				<Descriptions.Item span={2} label={'Graphics'}>
					{dynamicGraphicsOptions[graphics]}
				</Descriptions.Item>
			</Descriptions>
			<Button onClick={(evt) => apply(evt, props.plan)}>Apply This Plan</Button>
		</div>
	);
};

export default class G14ControlPlans extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let currentStore = store.getState() as G14Config;
		this.state = {
			plans: [...currentStore.plans],
		};
	}

	handleApply = async (event: any, plan: G14ControlPlan) => {
		message.loading('Applying G14Control plan...');
		let result = await window.ipcRenderer.invoke('setG14ControlPlan', plan);

		if (result) {
			message.success('Successfully applied plan: ' + plan.name);
		} else {
			message.error('Failed to apply plan: ' + plan.name);
		}
	};

	render() {
		let { plans } = this.state;
		return (
			<Space direction="vertical">
				{plans.map((plan) => {
					return (
						<ControlPlan
							{...{ plan: plan, apply: this.handleApply }}></ControlPlan>
					);
				})}
			</Space>
		);
	}
}

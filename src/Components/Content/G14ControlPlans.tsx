/** @format */

import { Button, Descriptions, message, Space } from 'antd';
import React, { Component } from 'react';
import { setCurrentG14ControlPlan, store } from '../../Store/ReduxStore';
import { capitalize } from 'lodash';
import PlanBuilder from './G14Plans/PlanBuilder';

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
	console.log(props.plan);
	return (
		<div>
			<Descriptions title={name} bordered>
				<Descriptions.Item span={3} label={'Windows Plan'}>
					{windowsPlan.name}
				</Descriptions.Item>
				<Descriptions.Item span={3} label={'Fan Curve'}>
					{fanCurve ? fanCurve : 'N/A'}
				</Descriptions.Item>
				<Descriptions.Item span={3} label={'Ryzenadj Config'}>
					{ryzenadj ? ryzenadj : 'N/A'}
				</Descriptions.Item>
				<Descriptions.Item span={3} label={'Armoury Crate'}>
					{armouryCrate ? capitalize(armouryCrate) : 'N/A'}
				</Descriptions.Item>
				<Descriptions.Item span={3} label={'CPU Boost'}>
					{boost || boost === 0 ? boostModeOptions[boost] : 'N/A'}
				</Descriptions.Item>
				<Descriptions.Item span={3} label={'Graphics'}>
					{graphics || graphics === 0
						? dynamicGraphicsOptions[graphics]
						: 'N/A'}
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
			store.dispatch(setCurrentG14ControlPlan(plan));
			message.success('Successfully applied plan: ' + plan.name);
		} else {
			message.error('Failed to apply plan: ' + plan.name);
		}
	};

	updatePlans = (plans: G14ControlPlan[]) => {
		this.setState({ plans });
	};

	render() {
		let { plans } = this.state;
		return (
			<Space direction="vertical">
				{plans.map((plan) => {
					return (
						<ControlPlan
							{...{
								plan: plan,
								apply: this.handleApply,
							}}></ControlPlan>
					);
				})}
				<PlanBuilder updatePlans={this.updatePlans} />
			</Space>
		);
	}
}

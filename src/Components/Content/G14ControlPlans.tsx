/** @format */

import {
	Button,
	Card,
	Descriptions,
	message,
	PageHeader,
	Select,
	Space,
} from 'antd';
import React, { Component } from 'react';
import {
	setCurrentG14ControlPlan,
	store,
	updateG14Plans,
} from '../../Store/ReduxStore';
import { capitalize } from 'lodash';
import PlanBuilder from './G14Plans/PlanBuilder';

interface Props {}
interface State {
	plans: G14ControlPlan[];
	selectedToView: G14ControlPlan;
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

let dummyPlan: GPlan = {
	fanCurve: undefined,
	ryzenadj: undefined,
	armouryCrate: undefined,
	boost: undefined,
	graphics: undefined,
	windowsPlan: undefined,
	name: 'Empty',
};

declare type GPlan = {
	name?: string;
	ryzenadj?: string;
	fanCurve?: string;
	boost?: number;
	armouryCrate?: ArmoryPlan;
	graphics?: number;
	windowsPlan?: { name: string; guid: string };
};

const ControlPlan = (props: {
	plan: G14ControlPlan;
	apply: (event: any, plan: G14ControlPlan) => void;
	delet: (event: any, plan: G14ControlPlan) => void;
}) => {
	let gPlan: GPlan = {};
	let noPlan = false;
	if (!props.plan) {
		gPlan = dummyPlan;
		noPlan = true;
	} else {
		gPlan = props.plan;
	}
	let {
		fanCurve,
		ryzenadj,
		armouryCrate,
		boost,
		graphics,
		windowsPlan,
		name,
	} = gPlan;
	let { apply, delet } = props;
	console.log(props.plan);
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				padding: '2rem "3%"',
			}}>
			<div style={{ width: '70%' }}>
				<Descriptions title={name} style={{ width: '100%' }} bordered>
					<Descriptions.Item span={3} label={'Windows Plan'}>
						{windowsPlan ? windowsPlan.name : 'No plans'}
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
			</div>
			<Card style={{ width: '30%', marginTop: '2.8rem' }}>
				<Space direction="vertical">
					<Button disabled={noPlan} onClick={(evt) => apply(evt, props.plan)}>
						Apply This Plan
					</Button>
					<Button disabled={noPlan} onClick={(evt) => delet(evt, props.plan)}>
						Delete This Plan
					</Button>
				</Space>
			</Card>
		</div>
	);
};

export default class G14ControlPlans extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let currentStore = store.getState() as G14Config;
		this.state = {
			plans: [...currentStore.plans],
			selectedToView: currentStore.plans[0],
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

	handleViewPlan = (val: any, option: any) => {
		let { plans } = this.state;
		let newPlan = plans.find((plan) => plan.name === val) as G14ControlPlan;
		this.setState({ selectedToView: newPlan });
	};

	deletePlan = (evt: any, plan: G14ControlPlan) => {
		let { plans } = this.state;
		let newListOfPlans = plans.filter((planI) => planI.name !== plan.name);
		store.dispatch(updateG14Plans(newListOfPlans));
		this.setState({ plans: newListOfPlans, selectedToView: newListOfPlans[0] });
	};

	render() {
		let { plans, selectedToView } = this.state;
		if (plans.length === 0) {
		}
		return (
			<Space direction="vertical" style={{ width: '100%' }}>
				<PageHeader
					title={'G14Control Plans'}
					subTitle={'Apply, Remove or Edit Plans'}
				/>
				<div
					style={{
						display: 'flex',
						width: '100%',
						justifyContent: 'flex-end',
					}}>
					<Select
						style={{ width: '30%' }}
						onSelect={this.handleViewPlan}
						value={
							this.state.selectedToView ? this.state.selectedToView.name : 'N/A'
						}
						options={plans.map((val, idx) => {
							return { value: val.name };
						})}></Select>
				</div>

				<ControlPlan
					{...{
						plan: selectedToView,
						apply: this.handleApply,
						delet: this.deletePlan,
					}}></ControlPlan>
				<PlanBuilder updatePlans={this.updatePlans} />
			</Space>
		);
	}
}

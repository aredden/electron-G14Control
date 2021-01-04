/** @format */

import { Unsubscribe } from '@reduxjs/toolkit';
import { Card, Checkbox, Select, Space } from 'antd';
import React, { Component } from 'react';
import {
	setACAutoPowerSwitching,
	setAutoSwitchingEnabled,
	setDCAutoPowerSwitching,
	store,
} from '../../../Store/ReduxStore';
import './AutoPowerSwitch.scss';
interface Props {}

interface State {
	allPlans: G14ControlPlan[];
	acPlan: G14ControlPlan | undefined;
	dcPlan: G14ControlPlan | undefined;
	enabled: boolean;
	unsub: Unsubscribe;
}

export default class AutoPowerSwitch extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let curState = store.getState() as G14Config;
		let { autoSwitch } = curState;
		let acPlan = undefined,
			dcPlan = undefined,
			enabled = false;

		if (autoSwitch) {
			acPlan = Object.assign({}, autoSwitch.acPlan);
			dcPlan = Object.assign({}, autoSwitch.dcPlan);
			enabled = autoSwitch.enabled ? autoSwitch.enabled : false;
		}
		let unsub = store.subscribe(this.onAddNewPlan);

		this.state = {
			allPlans: [...curState.plans],
			acPlan,
			dcPlan,
			enabled,
			unsub,
		};
	}

	onAddNewPlan = () => {
		let datas = store.getState() as G14Config;
		let names = datas.plans.map((dat) => dat.name);
		let oldnames = this.state.allPlans.map((dat) => dat.name);
		if (
			names.length !== oldnames.length ||
			names.find((name) => !oldnames.includes(name))
		) {
			this.setState({ allPlans: [...datas.plans] });
		}
	};

	onChooseAC = (value: any, option: any) => {
		let { allPlans } = this.state;
		let chosen = allPlans.find((plan) => {
			return plan.name === value;
		});
		if (chosen) {
			this.setState({ acPlan: chosen }, () => {
				store.dispatch(setACAutoPowerSwitching(chosen as G14ControlPlan));
			});
		}
	};

	onChooseDC = (value: any, option: any) => {
		let { allPlans } = this.state;
		let chosen = allPlans.find((plan) => {
			return plan.name === value;
		});
		if (chosen) {
			this.setState({ dcPlan: chosen }, () => {
				store.dispatch(setDCAutoPowerSwitching(chosen as G14ControlPlan));
			});
		}
	};

	chooseEnabled = () => {
		let { enabled } = this.state;
		this.setState({ enabled: !enabled }, () => {
			store.dispatch(setAutoSwitchingEnabled(!enabled));
		});
	};

	componentWillUnmount() {
		this.state.unsub();
	}

	render() {
		let { allPlans } = this.state;
		let possiblePlanOptions = allPlans.map((val) => {
			return { value: val.name };
		});

		let { enabled, acPlan, dcPlan } = this.state;

		return (
			<>
				<Card title={'Auto Power Switching'}>
					<Space direction="horizontal" className="powersw-container">
						<div>
							<label style={{ marginRight: '.5rem' }} htmlFor="checkAutoSwitch">
								Enable Auto Power Switching
							</label>
							<Checkbox
								onClick={this.chooseEnabled}
								checked={enabled}
								id="checkAutoSwitch"></Checkbox>
						</div>

						<Space direction="vertical" className="powersw-select-container">
							<label>AC Plan</label>
							<Select
								defaultValue={acPlan ? acPlan.name : ''}
								className="powersw-select"
								onSelect={this.onChooseAC}
								options={possiblePlanOptions}></Select>
						</Space>
						<Space direction="vertical" className="powersw-select-container">
							<label>DC Plan</label>
							<Select
								defaultValue={dcPlan ? dcPlan.name : ''}
								className="powersw-select"
								onSelect={this.onChooseDC}
								options={possiblePlanOptions}></Select>
						</Space>
					</Space>
				</Card>
			</>
		);
	}
}

/** @format */

import { Unsubscribe } from '@reduxjs/toolkit';
import { Card, Checkbox, Select, Space, message } from 'antd';
import React, { Component } from 'react';
import {
	setF5PlansPowerSwitching,
	setF5SwitchingEnabled,
	store,
} from '../../../Store/ReduxStore';
import './F5PowerSwitch.scss';

interface Props {}

interface State {
	allPlans: G14ControlPlan[];
	f5Plans: string[];
	enabled: boolean;
	unsub: Unsubscribe;
}

export default class F5PowerSwitch extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let curState = store.getState() as G14Config;
		let { f5Switch } = curState;
		let f5Plans = [] as string[],
			enabled = false;

		if (f5Switch) {
			f5Plans = f5Switch.f5Plans ? f5Switch.f5Plans : [];
			enabled = f5Switch.enabled ? f5Switch.enabled : false;
		}
		let unsub = store.subscribe(this.onAddNewPlan);

		this.state = {
			allPlans: [...curState.plans],
			f5Plans,
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

	onChooseF5Plans = (values: any) => {
		if (values) {
			this.setState({ f5Plans: values }, () => {
				store.dispatch(setF5PlansPowerSwitching(values as string[]));
			});
		}
	};

	chooseEnabled = async () => {
		let { enabled } = this.state;
		const new_enabled = !enabled;
		if (new_enabled) {
			message.loading('Remapping Fn+F5 Keys');
			let result = await window.ipcRenderer.invoke('remapFnF5');
			if (result) {
				message.success('Successfully remapped Fn+F5 to change the power plan');
				this.setState({ enabled: new_enabled }, () => {
					store.dispatch(setF5SwitchingEnabled(new_enabled));
				});
			} else {
				message.error('Error remapping Fn+F5 keys.');
			}
		} else {
			message.loading('Unbinding Fn+F5 Keys');
			let result = await window.ipcRenderer.invoke('unbindFnF5');
			if (result) {
				message.success('Successfully unbinded Fn+F5');
				this.setState({ enabled: new_enabled }, () => {
					store.dispatch(setF5SwitchingEnabled(new_enabled));
				});
			} else {
				message.error('Error unbinding Fn+F5 keys.');
			}
		}
	};

	componentWillUnmount() {
		this.state.unsub();
	}

	render() {
		let { allPlans } = this.state;
		let possiblePlanOptions = allPlans.map((val) => {
			return (
				<Select.Option key={val.name} value={val.name}>
					{val.name}
				</Select.Option>
			);
		});

		let { enabled, f5Plans } = this.state;

		return (
			<>
				<Card title={'Fn+F5 Power Switching'}>
					<Space direction="horizontal" className="f5powersw-container">
						<div>
							<Space direction="vertical">
								<div>
									<label
										style={{ marginRight: '.5rem' }}
										htmlFor="checkF5Switch">
										Enable Fn+F5 Power Switching
									</label>
									<Checkbox
										onClick={this.chooseEnabled}
										checked={enabled}
										id="checkF5Switch"></Checkbox>
								</div>
							</Space>
						</div>

						<Space direction="vertical" className="f5powersw-select-container">
							<label>Cycle between these Plans</label>
							<Select
								mode="multiple"
								allowClear
								defaultValue={f5Plans}
								className="f5powersw-select"
								onChange={this.onChooseF5Plans}>
								{possiblePlanOptions}
							</Select>
						</Space>
					</Space>
				</Card>
			</>
		);
	}
}

/** @format */

import { Card, Checkbox, Select, Space } from 'antd';
import React, { Component } from 'react';
import { store } from '../../../Store/ReduxStore';
import './AutoPowerSwitch.scss';
interface Props {}

interface State {
	allPlans: G14ControlPlan[];
	acPlan: G14ControlPlan | undefined;
	dcPlan: G14ControlPlan | undefined;
	enabled: boolean;
}

export default class AutoPowerSwitch extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let curState = store.getState() as G14Config;
		let { autoSwitch } = curState;
		this.state = {
			allPlans: [...curState.plans],
			acPlan: undefined,
			dcPlan: undefined,
			enabled: Boolean(autoSwitch),
		};
	}

	onChooseAC = (value: any, option: any) => {
		let { allPlans } = this.state;
		let chosen = allPlans.find((plan) => {
			return plan.name === value;
		});
		console.log(`chose ac plan: ` + chosen);
	};

	onChooseDC = (value: any, option: any) => {
		let { allPlans } = this.state;
		let chosen = allPlans.find((plan) => {
			return plan.name === value;
		});
		console.log(`chose dc plan: ` + chosen);
	};

	render() {
		let { allPlans } = this.state;
		let possiblePlanOptions = allPlans.map((val) => {
			return { value: val.name };
		});

		return (
			<>
				<Card title={'Auto Power Switching - Coming soon'}>
					<Space direction="horizontal" className="powersw-container">
						<label htmlFor="checkAutoSwitch">Enable Auto Power Switching</label>
						<Checkbox disabled id="checkAutoSwitch"></Checkbox>
						<Space direction="vertical" className="powersw-select-container">
							<label>AC Plan</label>
							<Select
								disabled
								className="powersw-select"
								onSelect={this.onChooseAC}
								options={possiblePlanOptions}></Select>
						</Space>
						<Space direction="vertical" className="powersw-select-container">
							<label>DC Plan</label>
							<Select
								disabled
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

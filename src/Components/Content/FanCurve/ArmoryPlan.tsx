/** @format */

import { message, Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import React, { Component } from 'react';
import { store, updateArmouryPlan } from '../../../Store/ReduxStore';

interface Props {
	selectPlan: (plan: ArmoryPlan) => void;
	currentPlan: ArmoryPlan | undefined;
	currentFan: string;
	armouryActive: boolean;
}

interface State {
	plan: ArmoryPlan | undefined;
}

export default class ArmoryPlanSettings extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			plan: this.props.currentPlan,
		};
	}

	handleRadioClick = (value: RadioChangeEvent) => {
		let option = value.target.value as ArmoryPlan;
		window.ipcRenderer
			.invoke('setArmoryPlan', option)
			.then((result: ArmoryPlan | false) => {
				if (result) {
					store.dispatch(updateArmouryPlan(option));
					this.setState({ plan: option }, () => {
						message.success(`Successfully set Armory Crate plan to: ${result}`);
					});
				} else {
					message.error(`Could not set Armory Crate default plan.`);
				}
				this.props.selectPlan(option);
			});
	};

	componentDidUpdate() {
		let { currentPlan, armouryActive } = this.props;
		let { plan } = this.state;
		if (!armouryActive && plan) {
			this.setState({ plan: undefined });
		} else if (armouryActive && !plan) {
			this.setState({ plan: currentPlan });
		}
	}

	render() {
		let { plan } = this.state;
		return (
			<>
				<Radio.Group
					value={plan}
					onChange={this.handleRadioClick}
					optionType={'default'}>
					<Radio value="windows" name="windows">
						Windows
					</Radio>
					<Radio value="silent" name="silent">
						Silent
					</Radio>
					<Radio value="performance" name="performance">
						Performance
					</Radio>
					<Radio value="turbo" name="turbo">
						Turbo
					</Radio>
				</Radio.Group>
			</>
		);
	}
}

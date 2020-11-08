/** @format */

import { Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import React, { Component } from 'react';

interface Props {
	selectPlan: (plan: ArmoryPlan) => void;
}

interface State {
	plan: ArmoryPlan | undefined;
}

export default class ArmoryPlanSettings extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			plan: 'silent',
		};
	}

	handleRadioClick = (value: RadioChangeEvent) => {
		let option = value.target.value;
		this.setState({ plan: option });
	};

	render() {
		let { plan } = this.state;

		return (
			<>
				<Radio.Group
					defaultValue={plan}
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

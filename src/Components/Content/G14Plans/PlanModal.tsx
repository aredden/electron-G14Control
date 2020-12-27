/** @format */

import React, { Component, createRef } from 'react';
import { Input, Modal, Form } from 'antd';
interface Props {
	submit: (e: any, name: string) => void;
	show: boolean;
	cancel: (e: any) => void;
	plans: G14ControlPlan[];
}
interface State {
	name: string;
	validateStat: '' | 'success' | 'warning' | 'error' | 'validating' | undefined;
	validateHelp: string;
	textRef: React.Ref<Input>;
	plans: G14ControlPlan[];
}

export default class PlanModal extends Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			name: '',
			textRef: createRef(),
			validateStat: '',
			validateHelp: '',
			plans: this.props.plans,
		};
	}

	handleType = (val: React.KeyboardEvent<HTMLInputElement>) => {
		this.setState({
			name: val.currentTarget.value,
			validateHelp: '',
			validateStat: '',
		});
	};

	checkIfValidAndSubmit = (val: any) => {
		let el = document.getElementById('planmodalinput') as HTMLInputElement;
		let { plans } = this.state;
		let planNames = plans.map((plan) => plan.name);
		if (el.value.length > 0) {
			if (planNames.includes(el.value)) {
				this.setState({
					validateStat: 'error',
					validateHelp: 'Plan names must be unique.',
				});
			} else {
				this.props.submit(val, el.value);
			}
		} else {
			this.setState({
				validateStat: 'error',
				validateHelp: "Name can't be literally nothing bruh.",
			});
		}
	};

	render() {
		let { show, cancel } = this.props;
		let { textRef } = this.state;
		return (
			<div>
				<Modal
					title="Choose Plan Name"
					visible={show}
					onOk={(e) => this.checkIfValidAndSubmit(e)}
					onCancel={(e) => cancel(e)}>
					<Form>
						<Form.Item
							validateStatus={this.state.validateStat}
							help={this.state.validateHelp}>
							<Input
								id="planmodalinput"
								onKeyDown={(e) => this.handleType(e)}
								ref={textRef}
							/>
						</Form.Item>
					</Form>
				</Modal>
			</div>
		);
	}
}

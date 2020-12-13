/** @format */

import React, { Component, createRef } from 'react';
import { Input, Modal } from 'antd';
import { TextAreaRef } from 'antd/lib/input/TextArea';
interface Props {
	submit: (e: any, name: string) => void;
	show: boolean;
	cancel: (e: any) => void;
}
interface State {
	name: string;
	validateStat: '' | 'success' | 'warning' | 'error' | 'validating' | undefined;
	validateHelp: string;
	textRef: React.Ref<TextAreaRef>;
}

export default class PlanModal extends Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			name: '',
			textRef: createRef(),
			validateStat: '',
			validateHelp: '',
		};
	}

	handleType = (val: React.KeyboardEvent<HTMLInputElement>) => {
		this.setState({ name: val.currentTarget.value });
	};

	checkIfValidAndSubmit = (val: any) => {
		let { name } = this.state;

		if (name.length > 0) {
			this.props.submit(val, name);
		} else {
			this.setState({
				validateStat: 'error',
				validateHelp: "Name can't be literally nothing bruh.",
			});
		}
	};

	render() {
		let { show, cancel } = this.props;
		return (
			<div>
				<Modal
					title="Choose Plan Name"
					visible={show}
					onOk={(e) => this.checkIfValidAndSubmit(e)}
					onCancel={(e) => cancel(e)}>
					<Input onKeyDown={(e) => this.handleType(e)} />
				</Modal>
			</div>
		);
	}
}

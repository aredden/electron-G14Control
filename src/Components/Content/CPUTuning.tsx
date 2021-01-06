/** @format */

import React, { Component } from 'react';
import RyzenADJ from './CPUTuning/RyzenADJ';
import Monitoring from './CPUTuning/Monitoring';
import { addRyzenadjPlan, store } from '../../Store/ReduxStore';
import { Form, Input, Modal } from 'antd';
interface Props {}

interface State {
	confirmModalVisible: boolean;
	possibleName: string;
	chosen: undefined | RyzenadjConfig;
	validateStatus:
		| ''
		| 'success'
		| 'warning'
		| 'error'
		| 'validating'
		| undefined;
	validateHelp: string;
	plans: RyzenadjConfigNamed[];
}

export default class CPUTuning extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			confirmModalVisible: false,
			possibleName: '',
			chosen: undefined,
			validateHelp: '',
			validateStatus: undefined,
			plans: [...(store.getState() as G14Config).ryzenadj.options],
		};
	}

	saveRyzenadjPlan = (plan: RyzenadjConfig) => {
		this.setState({ confirmModalVisible: true, chosen: plan });
	};

	confirmSaveRyzenadjPlan = () => {
		this.setState({ confirmModalVisible: false }, () => {
			let { possibleName, chosen } = this.state;
			if (chosen && possibleName) {
				let newPlan = Object.assign(chosen, {
					name: possibleName,
				}) as RyzenadjConfigNamed;
				store.dispatch(addRyzenadjPlan(newPlan));
				this.setState({
					possibleName: '',
					chosen: undefined,
					plans: [...(store.getState() as G14Config).ryzenadj.options, newPlan],
				});
			}
		});
	};

	changePossibleName = (evt: React.ChangeEvent<HTMLInputElement>) => {
		evt.persist();
		console.log(evt);
		let { plans, possibleName } = this.state;
		let newPossible = evt.target.value;
		if (newPossible.length <= 0) {
			this.setState({
				possibleName: newPossible,
				validateHelp: 'Name cannot be empty.',
				validateStatus: 'error',
			});
		} else if (plans.find((o) => o.name === newPossible)) {
			this.setState({
				possibleName: newPossible,
				validateHelp: 'Name must be unique.',
				validateStatus: 'error',
			});
		} else {
			this.setState({
				possibleName: newPossible,
				validateHelp: '',
				validateStatus: '',
			});
		}
	};

	render() {
		let { confirmModalVisible, validateHelp, validateStatus } = this.state;
		return (
			<>
				<Monitoring />
				<RyzenADJ onSaveRyzenadjPlan={this.saveRyzenadjPlan} />
				<Modal
					title={'Name your plan.'}
					visible={confirmModalVisible}
					onOk={this.confirmSaveRyzenadjPlan}
					okButtonProps={{
						disabled: validateStatus === 'error' ? true : false,
					}}
					onCancel={() => this.setState({ confirmModalVisible: false })}>
					<Form>
						<Form.Item validateStatus={validateStatus} help={validateHelp}>
							<Input
								value={this.state.possibleName}
								onChange={this.changePossibleName}
							/>
						</Form.Item>
					</Form>
				</Modal>
			</>
		);
	}
}

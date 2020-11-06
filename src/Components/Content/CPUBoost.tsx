/** @format */

import { Radio } from 'antd';
import React, { Component } from 'react';
import { RadioChangeEvent } from 'antd/lib/radio';
import getLogger from '../../Logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = getLogger('CPUBoost');

interface Props {
	plan?: { name: string; guid: string };
}

interface State {
	currentBoost: { ac: string; dc: string };
	chosenBoost: string;
}

export default class CPUBoost extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			currentBoost: { ac: '0', dc: '0' },
			chosenBoost: '0',
		};
	}

	getBoostListener = (
		_event: any,
		data: { ac: string; dc: string } | false
	) => {
		if (data) {
			this.setState({ currentBoost: data });
		}
	};

	componentDidMount() {
		window.ipcRenderer
			.invoke('getBoost', this.props.plan?.guid)
			.then(async (result: any) => {
				console.log(result);
				if (this.props.plan?.guid === result.guid) {
					this.setState({ currentBoost: result.boost });
				}
			});
	}

	chooseBoost = (e: RadioChangeEvent) => {
		let { value } = e.target;
		this.setState({ chosenBoost: value }, async () => {
			let result = await window.ipcRenderer.invoke(
				'setBoost',
				value,
				this.props.plan?.guid
			);
			if (result && this.props.plan) {
				if (result.result) {
					let { chosenBoost } = this.state;
					console.log(this.props.plan.guid, result);
					this.setState({
						currentBoost: { ac: chosenBoost, dc: chosenBoost },
					});
				}
			} else {
				alert('There was an issue setting boost, check logs for more details.');
			}
		});
	};

	render() {
		let { currentBoost } = this.state;
		return (
			<>
				<label
					style={{
						fontWeight: 'bold',
						padding: '.2rem',
						display: 'block',
						marginBottom: '-.5rem',
					}}>
					CPU Boost
				</label>
				<Radio.Group
					style={{ padding: '.2rem' }}
					onChange={(e) => this.chooseBoost(e)}
					value={parseInt(currentBoost.ac)}>
					<Radio value={0}>Disabled</Radio>
					<Radio value={4}>Efficient Aggressive</Radio>
					<Radio value={2}>Aggressive</Radio>
				</Radio.Group>
			</>
		);
	}
}

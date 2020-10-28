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
		window.ipcRenderer.send('getBoost', this.props.plan?.guid);

		window.ipcRenderer.on(
			'getBoostResult',
			(
				_event: any,
				result: { guid: string; boost: { ac: string; dc: string } }
			) => {
				console.log(_event, result);
				if (this.props.plan?.guid === result.guid) {
					this.setState({ currentBoost: result.boost });
				}
			}
		);

		window.ipcRenderer.on(
			'setBoostResult',
			(_event: any, result: { result: boolean; guid: string }) => {
				console.log(_event, result);
				let guid = this.props.plan?.guid;
				if (result.result && guid && guid === result.guid) {
					let { chosenBoost } = this.state;
					this.setState({
						currentBoost: { ac: chosenBoost, dc: chosenBoost },
					});
				}
			}
		);
	}

	chooseBoost = (e: RadioChangeEvent) => {
		let { value } = e.target;
		this.setState({ chosenBoost: value }, () => {
			window.ipcRenderer.send('setBoost', value, this.props.plan?.guid);
		});
	};

	render() {
		let { currentBoost } = this.state;
		return (
			<Radio.Group
				onChange={(e) => this.chooseBoost(e)}
				value={parseInt(currentBoost.ac)}>
				<Radio value={0}>Disabled</Radio>
				<Radio value={4}>Efficient Aggressive</Radio>
				<Radio value={2}>Aggressive</Radio>
			</Radio.Group>
		);
	}
}

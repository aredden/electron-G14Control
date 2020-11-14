/** @format */

import { Button } from 'antd';
import React, { Component } from 'react';

interface Props {}

interface State {}

export default class DiscreteGPU extends Component<Props, State> {
	handleClick = async () => {
		let result = await window.ipcRenderer.invoke('resetGPU');
		if (result) {
			alert('hmm');
		} else {
			alert('frick');
		}
	};

	render() {
		return (
			<div>
				<Button onClick={this.handleClick}>
					Reset GPU (or are you too scared? LOL noob)
				</Button>
			</div>
		);
	}
}

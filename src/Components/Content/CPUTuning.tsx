/** @format */

import React, { Component } from 'react';
import RyzenADJ from './RyzenADJ';
interface Props {}

interface State {}

export default class CPUTuning extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {};
	}

	onInputChange = () => {};

	render() {
		return (
			<>
				<RyzenADJ />
			</>
		);
	}
}

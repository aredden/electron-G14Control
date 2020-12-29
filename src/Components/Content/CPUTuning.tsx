/** @format */

import React, { Component } from 'react';
import RyzenADJ from './CPUTuning/RyzenADJ';
import Monitoring from './CPUTuning/Monitoring';
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
				<Monitoring />
			</>
		);
	}
}

/** @format */

import React, { Component } from 'react';
import FanCurve from './FanCurve';
import RyzenADJ from './RyzenADJ';
interface Props {}

interface State {}

export default class Configuration extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {};
	}

	onInputChange = () => {};

	render() {
		return (
			<>
				<RyzenADJ />
				<FanCurve />
			</>
		);
	}
}

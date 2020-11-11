/** @format */

import React, { Component } from 'react';
import { Select as AntSelect } from 'antd';

const { Option } = AntSelect;

interface Props {
	defaultSelect: FanCurveConfig;
	selectables: Array<{ name: string }>;
	handleChange: (e: any) => void;
}

interface State {}

export default class Select extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {};
	}

	render() {
		let { selectables, handleChange, defaultSelect } = this.props;
		return (
			<AntSelect
				defaultValue={defaultSelect.name}
				style={{ width: 170 }}
				onChange={(val) => handleChange(val)}>
				{selectables.map((value) => {
					return <Option value={value.name}>{value.name}</Option>;
				})}
			</AntSelect>
		);
	}
}

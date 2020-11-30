/** @format */

import { Descriptions } from 'antd';
import React, { Component } from 'react';

interface Props {
	plan: { name: string; guid: string };
	graphics: { ac: number; dc: number };
}

interface State {}

const dynamicGraphicsOptions = [
	'Force power-saving graphics',
	'Optimize power savings',
	'Optimize performance',
	'Maximize performance',
];

export default class GraphicsDescriptions extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {};
	}

	render() {
		const descriptionTitle = (
			<div style={{ paddingBottom: '.1rem', fontSize: '1rem' }}>
				Switchable Dynamic Graphics
			</div>
		);

		const descriptionStyle: React.CSSProperties = {
			maxWidth: '100%',
			fontSize: '.4rem',
			marginLeft: '.5rem',
			marginBottom: '.5rem',
			marginTop: '-1rem',
		};

		const descriptionItemStyle: React.CSSProperties = {
			fontSize: '13px',
			paddingLeft: '.8rem',
			paddingRight: '.8rem',
		};

		let { plan, graphics } = this.props;

		return (
			<Descriptions
				style={descriptionStyle}
				title={descriptionTitle}
				size="small"
				bordered>
				<Descriptions.Item
					style={descriptionItemStyle}
					span={5}
					label={'Windows Power Plan'}>
					{plan.name}
				</Descriptions.Item>
				<Descriptions.Item
					style={descriptionItemStyle}
					span={5}
					label={'Plugged In'}>
					{dynamicGraphicsOptions[graphics.ac]}
				</Descriptions.Item>
				<Descriptions.Item
					style={descriptionItemStyle}
					span={5}
					label={'On Battery'}>
					{dynamicGraphicsOptions[graphics.dc]}
				</Descriptions.Item>
			</Descriptions>
		);
	}
}

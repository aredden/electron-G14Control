/** @format */

import { Card, Divider, Row } from 'antd';
import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTemperatureHigh } from '@fortawesome/free-solid-svg-icons';
interface Props {
	values: { label: string; value: number; speed: number }[];
}
interface State {}

const buildColor = (result: number) => {
	if (result < 40) {
		return '#89C379';
	} else if (result < 65) {
		return '#E5A153';
	} else {
		return '#FF4D4D';
	}
};

const buildColorFreq = (result: number) => {
	if (result <= 2) {
		return '#89C379';
	} else if (result <= 2.99) {
		return '#E5A153';
	} else {
		return '#FF4D4D';
	}
};

const CPUPill = ({
	label,
	value,
	speed,
}: {
	label: string;
	value: number;
	speed: number;
}) => {
	return (
		<div className="cpucore">
			<label>{label}</label>
			<div style={{ color: buildColor(value) }}>
				{value.toFixed(2)}
				&nbsp;
				<FontAwesomeIcon icon={faTemperatureHigh} />
				<Divider
					type="horizontal"
					style={{
						padding: 0,
						height: '.04rem',
						margin: '.01rem',
						backgroundColor: '#6974A6',
					}}></Divider>
				<div style={{ display: 'flex', color: 'unset' }}>
					<div
						style={{
							width: '100%',

							color: buildColorFreq(speed),
						}}>
						{speed.toFixed(2) + ' GHz'}
					</div>
				</div>
			</div>
		</div>
	);
};

export default class CCX extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {};
	}

	render() {
		let { values } = this.props;
		let title = values[0] && values[0].label === 'Core 0' ? '1' : '2';
		return (
			<Card
				headStyle={{ borderBottom: 0, color: 'white' }}
				title={'CCX ' + title}
				style={{
					margin: '.5rem',
					width: '46%',
					backgroundColor: '#556a7e',
					borderRadius: '1rem',
					border: '2px solid silver',
				}}>
				<Row>
					<CPUPill {...values[0]} />
					<CPUPill {...values[1]} />
				</Row>
				<Row>
					{values.length === 4 ? (
						<>
							<CPUPill {...values[2]} />
							<CPUPill {...values[3]} />
						</>
					) : (
						''
					)}
				</Row>
			</Card>
		);
	}
}

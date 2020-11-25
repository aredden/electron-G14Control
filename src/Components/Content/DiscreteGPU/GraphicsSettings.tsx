/** @format */

import { Descriptions, message, Popover, Radio, Space } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import React, { Component } from 'react';

interface Props {}

interface State {
	plan: {
		name: string;
		guid: string;
	};
	graphics: {
		ac: number;
		dc: number;
	};
}

const dynamicGraphicsOptions = [
	'Force power-saving graphics',
	' Optimize power savings',
	'Optimize performance',
	' Maximize performance',
];

export default class GraphicsSettings extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			plan: {
				name: '',
				guid: '',
			},
			graphics: {
				ac: 0,
				dc: 0,
			},
		};
	}

	componentDidMount() {
		window.ipcRenderer.invoke('getSwitchableDynamicGraphics').then(
			(
				returned:
					| false
					| {
							plan: { name: string; guid: string };
							result: { ac: number; dc: number };
					  }
			) => {
				if (
					returned &&
					typeof returned.result.ac === 'number' &&
					typeof returned.result.dc === 'number'
				) {
					this.setState({ plan: returned.plan, graphics: returned.result });
				}
			}
		);
	}

	handleChangeGraphics = (event: RadioChangeEvent) => {
		let settingToChange = event.target.value;
		message.loading('Applying new switchable dynamic graphics setting...');
		window.ipcRenderer
			.invoke('setSwitchableDynamicGraphics', settingToChange)
			.then((result: string | false) => {
				if (result) {
					message.success(
						'Successfully applied new switchable dynamic graphics setting!'
					);
					this.setState({
						graphics: {
							ac: settingToChange,
							dc: settingToChange,
						},
					});
				} else {
					message.error(
						'There was an issue applying switchable dynamic graphics settings.'
					);
				}
			});
	};

	render() {
		let { plan, graphics } = this.state;

		const graphicsTitleStyle: React.CSSProperties = {
			display: 'block',
			marginBottom: '1rem',
		};

		const radioStyle: React.CSSProperties = {
			display: 'block',
			position: 'absolute',
			right: '70px',
			top: '175px',
			justifyContent: 'end',
			marginTop: '2rem',
			padding: '1rem',
			paddingLeft: '1.2rem',
			paddingRight: '1.2rem',
			height: 'min-content',
			lineHeight: '10px',
			background: '#FAFAFA',
			border: '1px solid #F0F0F0',
		};

		const radioGroupStyle: React.CSSProperties = {};

		const radioButtonStyle: React.CSSProperties = {
			display: 'block',
		};

		const popoverContent = (
			<div>
				<p>This setting differs per Windows Power Plan.</p>
			</div>
		);

		return (
			<div
				style={{
					marginBottom: '2rem',
					marginTop: '2rem',
					marginLeft: '.7rem',
				}}>
				<Space>
					<Descriptions
						title="Switchable Dynamic Graphics"
						size="small"
						bordered>
						<Descriptions.Item span={5} label={'Windows Power Plan'}>
							{plan.name}
						</Descriptions.Item>
						<Descriptions.Item span={5} label={'Plugged In'}>
							{dynamicGraphicsOptions[graphics.ac]}
						</Descriptions.Item>
						<Descriptions.Item span={5} label={'On Battery'}>
							{dynamicGraphicsOptions[graphics.dc]}
						</Descriptions.Item>
					</Descriptions>
					<div style={radioStyle}>
						<Popover
							content={popoverContent}
							title="Switchable Dynamic Graphics">
							<h3 style={graphicsTitleStyle}>Graphics Options</h3>
							<Radio.Group
								name="Graphics Options"
								value={graphics.ac}
								style={radioGroupStyle}
								size="middle"
								onChange={this.handleChangeGraphics}>
								<Radio.Button style={radioButtonStyle} value={0}>
									{dynamicGraphicsOptions[0]}
								</Radio.Button>
								<Radio.Button style={radioButtonStyle} value={1}>
									{dynamicGraphicsOptions[1]}
								</Radio.Button>
								<Radio.Button style={radioButtonStyle} value={2}>
									{dynamicGraphicsOptions[2]}
								</Radio.Button>
								<Radio.Button style={radioButtonStyle} value={3}>
									{dynamicGraphicsOptions[3]}
								</Radio.Button>
							</Radio.Group>
						</Popover>
					</div>
				</Space>
			</div>
		);
	}
}

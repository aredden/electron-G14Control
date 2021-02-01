/** @format */

import { message, Popover, Radio, Space } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import React, { Component } from 'react';
import GraphicsDescriptions from './GraphicsDescriptions';
import './DiscreteGPU.scss';
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
	plugged: boolean;
}

const dynamicGraphicsOptions = [
	'Force power-saving graphics',
	'Optimize power savings',
	'Optimize performance',
	'Maximize performance',
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
			plugged: true,
		};
	}

	componentDidMount() {
		window.ipcRenderer.invoke('getActivePlan').then((res) => {
			if (res) {
				this.setState({ plan: res.guid });
			}
		});
		window.ipcRenderer
			.invoke('getSwitchableDynamicGraphics')
			.then((returned: false | { ac: string; dc: string }) => {
				if (
					returned &&
					typeof returned.ac === 'string' &&
					typeof returned.dc === 'string'
				) {
					const { ac, dc } = returned;
					this.setState({ graphics: { ac: parseInt(ac), dc: parseInt(dc) } });
				}
			});
		this.getPowerDelivery();
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

	getPowerDelivery = async () => {
		let result:
			| false
			| {
					ac: boolean;
					dc: boolean;
					usb: boolean;
			  } = await window.ipcRenderer.invoke('isPlugged');
		this.setState({ plugged: result ? result.ac || result.usb : true });
	};

	render() {
		let { graphics } = this.state;

		const graphicsTitleStyle: React.CSSProperties = {
			display: 'block',
			marginBottom: '2rem',
		};

		const radioStyle: React.CSSProperties = {
			display: 'block',
			position: 'relative',
			right: '-35px',
			top: '-20px',
			justifyContent: 'end',
			marginTop: '0rem',
			padding: '1.6rem 1.2rem 2rem 1.2rem',
			height: 'min-content',
			lineHeight: '10px',
			background: '#FAFAFA',
			border: '1px solid #E0E0E0',
		};

		const radioGroupStyle: React.CSSProperties = {
			height: '50px',
		};

		const radioButtonStyle: React.CSSProperties = {
			display: 'block',
			paddingTop: '.18rem',
			paddingBottom: '.2rem',
			height: '35px',
			borderRadius: '0rem',
		};

		const popoverContent = (
			<div style={{ marginBottom: '-0.2rem' }}>
				<p>This setting differs per Windows Power Plan.</p>
			</div>
		);

		let { plugged } = this.state;

		return (
			<div
				style={{
					marginLeft: '1rem',
					justifyContent: 'center',
					marginBottom: '0rem',
					marginTop: '2rem',
				}}>
				<Space size="middle">
					<GraphicsDescriptions
						graphics={this.state.graphics}
						plan={this.state.plan}></GraphicsDescriptions>
					<div style={radioStyle}>
						<h3 style={graphicsTitleStyle}>Graphics Options</h3>
						<Popover title="Graphics Options" content={popoverContent}>
							<Radio.Group
								name="Graphics Options"
								value={plugged ? graphics.ac : graphics.dc}
								style={radioGroupStyle}
								size="middle"
								onChange={this.handleChangeGraphics}>
								<Radio.Button
									className="hoverButtonColor"
									style={radioButtonStyle}
									value={0}>
									{dynamicGraphicsOptions[0]}
								</Radio.Button>
								<Radio.Button
									className="hoverButtonColor"
									style={radioButtonStyle}
									value={1}>
									{dynamicGraphicsOptions[1]}
								</Radio.Button>
								<Radio.Button
									className="hoverButtonColor"
									style={radioButtonStyle}
									value={2}>
									{dynamicGraphicsOptions[2]}
								</Radio.Button>
								<Radio.Button
									className="hoverButtonColor"
									style={radioButtonStyle}
									value={3}>
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

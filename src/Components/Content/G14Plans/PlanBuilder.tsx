/** @format */

import { Button, Card, Checkbox, message, Space } from 'antd';
import React, { Component } from 'react';
import { store, updateG14Plans } from '../../../Store/ReduxStore';
import ReactMarkdown from 'react-markdown';
import Select, { LabeledValue } from 'antd/lib/select';
import { capitalize } from 'lodash';
import PlanModal from './PlanModal';

interface Props {
	updatePlans: (plans: G14ControlPlan[]) => void;
}
interface State {
	ryzen: RyzenadjConfigNamed[];
	curves: FanCurveConfig[];
	windowsPlans: { name: string; guid: string }[];
	setPlan: G14ControlPlan;
	showModal: boolean;
	toInclude: {
		ryzen: boolean;
		fan: boolean;
		boost: boolean;
		graphics: boolean;
		armoury: boolean;
	};
}

export default class PlanBuilder extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let currentState = store.getState() as G14Config;
		let curve = [...currentState.fanCurves] as FanCurveConfig[];
		let ryzen = [...currentState.ryzenadj.options];
		this.state = {
			ryzen: [...ryzen],
			curves: [...curve],
			windowsPlans: [],
			setPlan: {
				name: '',
				windowsPlan: {
					guid: '',
					name: '',
				},
			},
			showModal: false,
			toInclude: {
				ryzen: true,
				fan: true,
				graphics: true,
				boost: true,
				armoury: true,
			},
		};
	}

	handleSelectChoice = (
		value: string | number | LabeledValue,
		option: any,
		type: string
	) => {
		let { setPlan, windowsPlans, ryzen } = this.state;
		switch (type) {
			case 'fan':
				this.setState({
					setPlan: Object.assign(setPlan, { fanCurve: value }),
				});
				break;
			case 'windo':
				this.setState({
					setPlan: Object.assign(setPlan, {
						windowsPlan: windowsPlans.find((nam) => nam.name === value),
					}),
				});
				break;
			case 'ryzen':
				this.setState({
					setPlan: Object.assign(setPlan, {
						ryzenadj: (ryzen.find(
							(name) => name.name === value
						) as RyzenadjConfigNamed).name,
					}),
				});
				break;
			case 'armor':
				this.setState({
					setPlan: Object.assign(setPlan, { armouryCrate: value }),
				});
				break;
			case 'boos':
				let val = value === 'Aggressive' ? 2 : value === 'Disabled' ? 0 : 4;
				this.setState({
					setPlan: Object.assign(setPlan, { boost: val }),
				});
				break;
			case 'graphi':
				this.setState({
					setPlan: Object.assign(setPlan, {
						graphics: [
							'Force power-saving graphics',
							'Optimize power savings',
							'Optimize performance',
							'Maximize performance',
						].indexOf(value as string),
					}),
				});
				break;
		}
	};

	getWindowsPlans = async () => {
		let win = (await window.ipcRenderer.invoke(
			'getWindowsPlans'
		)) as WindowsPlan[];
		if (win) {
			this.setState({ windowsPlans: win });
		} else {
			message.error('There was an issue getting windows plans.');
		}
	};

	handleSaveConfig = async () => {
		let { setPlan } = this.state;
		if (setPlan.windowsPlan.name === '') {
			message.warn('Plan must have an associated Windows Plan!');
		} else {
			this.setState({ showModal: true });
		}
	};

	handleSubmitSaveConfig = async (e: any, name: string) => {
		let { setPlan } = this.state;
		setPlan.name = name;

		this.setState({ showModal: false }, () => {
			let plns = (store.getState() as G14Config).plans;
			store.dispatch(updateG14Plans([...plns, setPlan]));
			this.props.updatePlans([...plns, setPlan]);
		});
	};

	handleCancelSave = async (e: any) => {
		this.setState({ showModal: false });
	};

	componentDidMount() {
		this.getWindowsPlans();
	}

	toggleCheck(value: any, option: any) {
		let { toInclude, setPlan } = this.state;
		switch (option) {
			case 'armoury': {
				if (toInclude.armoury) {
					delete setPlan.armouryCrate;
				}
				this.setState({
					toInclude: Object.assign(toInclude, { armoury: !toInclude.armoury }),
					setPlan,
				});
				break;
			}
			case 'ryzen': {
				if (toInclude.ryzen) {
					delete setPlan.ryzenadj;
				}
				this.setState({
					toInclude: Object.assign(toInclude, { ryzen: !toInclude.ryzen }),
					setPlan,
				});
				break;
			}
			case 'fan': {
				if (toInclude.fan) {
					delete setPlan.fanCurve;
				}
				this.setState({
					toInclude: Object.assign(toInclude, { fan: !toInclude.fan }),
					setPlan,
				});
				break;
			}
			case 'boost': {
				if (toInclude.boost) {
					delete setPlan.boost;
				}
				this.setState({
					toInclude: Object.assign(toInclude, { boost: !toInclude.boost }),
					setPlan,
				});
				break;
			}
			case 'graphics': {
				if (toInclude.graphics) {
					delete setPlan.graphics;
				}
				this.setState({
					toInclude: Object.assign(toInclude, {
						graphics: !toInclude.graphics,
					}),
					setPlan,
				});
				break;
			}
		}
	}

	render() {
		let thinger = `### **Plan Builder**`;

		const itemStyle: React.CSSProperties = {
			display: 'flex',
			width: '100%',
			justifyContent: 'space-between',
		};

		const containerStyle: React.CSSProperties = {
			width: '100%',
		};

		const selectChoice: React.CSSProperties = {
			width: '11rem',
		};

		let { curves, ryzen, windowsPlans, showModal, toInclude } = this.state;
		console.log(this.state.setPlan);
		return (
			<Card
				title={
					<div style={{ marginBottom: '-.3rem' }}>
						<ReactMarkdown>{thinger}</ReactMarkdown>
					</div>
				}>
				<Space direction="vertical" style={containerStyle}>
					<Space direction={'horizontal'} style={itemStyle}>
						<label>Choose Windows Plan</label>
						<Space direction="horizontal">
							<Select
								style={selectChoice}
								defaultValue={'Choice'}
								options={windowsPlans.map((crv, idx) => {
									return { name: crv.name, value: crv.name };
								})}
								onSelect={(e, d) =>
									this.handleSelectChoice(e, d, 'windo')
								}></Select>
						</Space>
					</Space>
					<Space direction={'horizontal'} style={itemStyle}>
						<label>Fan Curve</label>
						<Space direction="horizontal">
							<small>Include:</small>
							<Checkbox
								onClick={(e) =>
									this.toggleCheck(this.state.toInclude.fan, 'fan')
								}
								checked={this.state.toInclude.fan}></Checkbox>
							<Select
								style={selectChoice}
								defaultValue={'Choice'}
								options={curves.map((crv, idx) => {
									return { name: crv.name, value: crv.name };
								})}
								disabled={!toInclude.fan}
								onSelect={(e, d) =>
									this.handleSelectChoice(e, d, 'fan')
								}></Select>
						</Space>
					</Space>
					<Space direction={'horizontal'} style={itemStyle}>
						<label>CPU Tuning Setting</label>
						<Space direction="horizontal">
							<small>Include:</small>
							<Checkbox
								onClick={(e) =>
									this.toggleCheck(this.state.toInclude.ryzen, 'ryzen')
								}
								checked={this.state.toInclude.ryzen}></Checkbox>
							<Select
								disabled={!toInclude.ryzen}
								style={selectChoice}
								defaultValue={'Choice'}
								options={ryzen.map((crv, idx) => {
									return { name: crv.name, value: crv.name };
								})}
								onSelect={(e, d) =>
									this.handleSelectChoice(e, d, 'ryzen')
								}></Select>
						</Space>
					</Space>

					<Space direction={'horizontal'} style={itemStyle}>
						<label>Armoury Crate Plan</label>
						<Space direction="horizontal">
							<small>Include:</small>
							<Checkbox
								onClick={(e) =>
									this.toggleCheck(this.state.toInclude.armoury, 'armoury')
								}
								checked={this.state.toInclude.armoury}></Checkbox>
							<Select
								disabled={!toInclude.armoury}
								style={selectChoice}
								defaultValue={'Choice'}
								options={['windows', 'silent', 'performance', 'turbo'].map(
									(crv, idx) => {
										return { name: crv, value: capitalize(crv) };
									}
								)}
								onSelect={(e, d) =>
									this.handleSelectChoice(e, d, 'armor')
								}></Select>
						</Space>
					</Space>
					<Space direction={'horizontal'} style={itemStyle}>
						<label>Boost</label>
						<Space direction="horizontal">
							<small>Include:</small>
							<Checkbox
								onClick={(e) =>
									this.toggleCheck(this.state.toInclude.boost, 'boost')
								}
								checked={this.state.toInclude.boost}></Checkbox>
							<Select
								style={selectChoice}
								disabled={!toInclude.boost}
								defaultValue={'Choice'}
								options={['Aggressive', 'Efficient Aggressive', 'Disabled'].map(
									(crv, idx) => {
										return { name: crv, value: capitalize(crv) };
									}
								)}
								onSelect={(e, d) =>
									this.handleSelectChoice(e, d, 'boos')
								}></Select>
						</Space>
					</Space>
					<Space direction={'horizontal'} style={itemStyle}>
						<label>Graphics Preference</label>
						<Space direction="horizontal">
							<small>Include:</small>
							<Checkbox
								onClick={(e) =>
									this.toggleCheck(this.state.toInclude.graphics, 'graphics')
								}
								checked={this.state.toInclude.graphics}></Checkbox>
							<Select
								disabled={!toInclude.graphics}
								style={selectChoice}
								defaultValue={'Choice'}
								allowClear
								options={[
									'Force power-saving graphics',
									'Optimize power savings',
									'Optimize performance',
									'Maximize performance',
								].map((crv, idx) => {
									return { name: crv, value: capitalize(crv) };
								})}
								onSelect={(e, d) =>
									this.handleSelectChoice(e, d, 'graphi')
								}></Select>
						</Space>
					</Space>
					<Button onClick={this.handleSaveConfig}>Save Plan</Button>
				</Space>
				<br></br>

				<PlanModal
					cancel={this.handleCancelSave}
					show={showModal}
					submit={this.handleSubmitSaveConfig}></PlanModal>
			</Card>
		);
	}
}

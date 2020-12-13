/** @format */

import { Card, message, Space, Switch } from 'antd';
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
	fanInclude: boolean;
	adjInclude: boolean;
	setPlan: G14ControlPlan;
	showModal: boolean;
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
			fanInclude: true,
			adjInclude: true,
			setPlan: {
				name: '',
				windowsPlan: {
					guid: '',
					name: '',
				},
			},
			showModal: false,
		};
	}

	onFanIncludeChange = () => {
		let { fanInclude } = this.state;
		this.setState({ fanInclude: !fanInclude });
	};

	onAdjIncludeChange = () => {
		let { adjInclude } = this.state;
		this.setState({ adjInclude: !adjInclude });
	};

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

	render() {
		let thinger = `
### **Plan Builder**
		`;

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

		let {
			curves,
			ryzen,
			windowsPlans,
			fanInclude,
			adjInclude,
			showModal,
		} = this.state;
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
						<label>Fan Curve</label>
						<Select
							style={selectChoice}
							defaultValue={'Choice'}
							options={curves.map((crv, idx) => {
								return { name: crv.name, value: crv.name };
							})}
							disabled={!fanInclude}
							onSelect={(e, d) =>
								this.handleSelectChoice(e, d, 'fan')
							}></Select>
					</Space>
					<Space direction={'horizontal'} style={itemStyle}>
						<label>CPU Tuning Setting</label>
						<Select
							disabled={!adjInclude}
							style={selectChoice}
							defaultValue={'Choice'}
							options={ryzen.map((crv, idx) => {
								return { name: crv.name, value: crv.name };
							})}
							onSelect={(e, d) =>
								this.handleSelectChoice(e, d, 'ryzen')
							}></Select>
					</Space>
					<Space direction={'horizontal'} style={itemStyle}>
						<label>Choose Windows Plan</label>
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
					<Space direction={'horizontal'} style={itemStyle}>
						<label>Armoury Crate Plan</label>
						<Select
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
					<Space direction={'horizontal'} style={itemStyle}>
						<label>Boost</label>
						<Select
							style={selectChoice}
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
					<Space direction={'horizontal'} style={itemStyle}>
						<label>Graphics Preference</label>
						<Select
							style={selectChoice}
							defaultValue={'Choice'}
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
				<br></br>
				<div
					style={{
						display: 'flex',
						justifyContent: 'start',
						padding: '1rem',
					}}>
					<Space direction="vertical">
						<label>Use Fan or just Armoury Crate Setting.</label>
						<Switch
							onClick={this.onFanIncludeChange}
							checked={fanInclude}
							title="Includes Fan Curve"></Switch>
						<label>Include CPU tuning.</label>
						<Switch
							onClick={this.onAdjIncludeChange}
							checked={adjInclude}
							title="Include CPU Tuning"></Switch>
						<button onClick={this.handleSaveConfig}>Save Plan</button>
					</Space>
				</div>
				<PlanModal
					cancel={this.handleCancelSave}
					show={showModal}
					submit={this.handleSubmitSaveConfig}></PlanModal>
			</Card>
		);
	}
}

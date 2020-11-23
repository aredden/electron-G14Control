/** @format */

import React, { Component } from 'react';
import cjs, { Chart } from 'chart.js';
import * as dragData from 'chartjs-plugin-dragdata';
import { buildDataSet, createChart } from './FanCurve/FanCurveChartConfig';
import { Button, Card, Input, message, Modal, PageHeader } from 'antd';
import ArmoryPlanSettings from './FanCurve/ArmoryPlan';
import {
	store,
	updateCurrentConfig,
	updateFanConfig,
} from '../../Store/ReduxStore';
import Select from './FanCurve/Select';
import './FanCurve.scss';
interface Props {}

interface State {
	currentPlanName: string;
	chart: cjs | undefined;
	currentCurves: {
		cpu: Array<number>;
		gpu: Array<number>;
	};
	fanCurves: Array<FanCurveConfig>;
	charts: {
		cpu: Chart | undefined;
		gpu: Chart | undefined;
	};
	plan: ArmoryPlan;
	modalVisible: boolean;
	modalLoading: boolean;
	newName: string;
}

export default class FanCurve extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let currentState = store.getState() as G14Config;
		let { cpu, gpu, plan, name } = currentState.fanCurves.find((value) => {
			return value.name === currentState.current.fanCurve;
		}) as { name: string; plan: ArmoryPlan; cpu: number[]; gpu: number[] };
		this.state = {
			currentPlanName: name,
			chart: undefined,
			currentCurves: {
				cpu: [...cpu],
				gpu: [...gpu],
			},
			charts: {
				cpu: undefined,
				gpu: undefined,
			},
			fanCurves: currentState.fanCurves,
			plan: plan,
			modalVisible: false,
			modalLoading: false,
			newName: '',
		};
	}

	deletePlan = () => {
		let { currentCurves, plan, fanCurves, currentPlanName } = this.state;
		let reduxState = store.getState() as G14Config;
		if (reduxState.current.fanCurve === currentPlanName) {
			message.error(
				"Don't murder the plan you're currently using ya' dum dum."
			);
			return;
		} else {
			let newFanCurves = fanCurves.filter((curveConfig) => {
				return curveConfig.name !== currentPlanName;
			});
			if (newFanCurves.length > 0) {
				currentCurves.cpu = [...newFanCurves[0].cpu];
				currentCurves.gpu = [...newFanCurves[0].gpu];
				plan = newFanCurves[0].plan;
				currentPlanName = newFanCurves[0].name;
				store.dispatch(updateFanConfig(newFanCurves));
				this.setState(
					{
						fanCurves: newFanCurves,
						plan: plan,
						currentPlanName: currentPlanName,
					},
					() => {
						this.chooseFanCurveThing(currentPlanName);
					}
				);
			}
		}
	};

	savePlan = () => {
		let { currentCurves, plan, fanCurves, newName } = this.state;
		let { cpu, gpu } = currentCurves;
		let newFanConfigOption: FanCurveConfig = {
			name: newName,
			cpu: cpu,
			gpu: gpu,
			plan: plan,
		};
		let newFanCurves = [...fanCurves, newFanConfigOption];
		store.dispatch(updateFanConfig(newFanCurves));
		this.setState({
			currentPlanName: newName,
			fanCurves: newFanCurves,
			newName: '',
			modalLoading: false,
			modalVisible: false,
		});
	};

	selectArmoryPlan = (plan: ArmoryPlan) => {
		console.log(plan);
		this.setState({ plan: (plan + '') as ArmoryPlan });
	};

	handleMapModify = (key: string, index: number, value: number) => {
		if (key === 'fanCurveChartCPU') {
			let { gpu, cpu } = this.state.currentCurves;
			this.setState({
				currentCurves: {
					cpu: cpu.map((val, idx) => {
						return idx === index ? value : val;
					}),
					gpu,
				},
			});
		} else if (key === 'fanCurveChartGPU') {
			let { gpu, cpu } = this.state.currentCurves;
			this.setState({
				currentCurves: {
					cpu,
					gpu: gpu.map((val, idx) => {
						return idx === index ? value : val;
					}),
				},
			});
		}
	};

	handleSubmitCurves = async (e: any) => {
		message.loading('Setting fan curve.', 1);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		window.ipcRenderer
			.invoke('setFanCurve', {
				...this.state.currentCurves,
				plan: this.state.plan,
			})
			.then((result: any) => {
				if (result) {
					let state = store.getState() as G14Config;
					store.dispatch(
						updateCurrentConfig({
							ryzenadj: state.current.ryzenadj,
							fanCurve: this.state.currentPlanName,
						})
					);
					message.success('Sucessfully set fan curve.');
				} else {
					message.success('Failed to set fan curve.');
				}
			})
			.catch((error: any) => {
				message.error('Failed to set fan curves because of error.');
			});
	};

	componentDidMount() {
		//Testing fan curve data
		let { cpu, gpu } = this.state.currentCurves;
		Chart.pluginService.register(dragData);
		let cpuChart = createChart('fanCurveChartCPU', this.handleMapModify, cpu);
		let gpuChart = createChart('fanCurveChartGPU', this.handleMapModify, gpu);
		this.setState({
			charts: {
				cpu: cpuChart,
				gpu: gpuChart,
			},
		});
	}

	componentWillUnmount() {
		Chart.pluginService.unregister(dragData);
	}

	chooseFanCurveThing = (name: string) => {
		let { fanCurves, charts } = this.state;
		let chosen = fanCurves.find((curve) => {
			return curve.name === name;
		});

		if (chosen && charts.cpu && charts.gpu) {
			let { cpu, gpu, plan } = chosen;
			let cpuc = buildDataSet([...cpu], 'fanCurveChartCPU');
			let gpuc = buildDataSet([...gpu], 'fanCurveChartGPU');
			//@ts-ignore
			charts.cpu.config.data.datasets = cpuc;
			//@ts-ignore
			charts.gpu.config.data.datasets = gpuc;
			charts.cpu.update();
			charts.gpu.update();
			this.setState({
				plan: (plan + '') as ArmoryPlan,
				currentPlanName: chosen.name,
				currentCurves: { cpu: [...cpu], gpu: [...gpu] },
			});
		}
	};

	handleModalOk = () => {
		this.setState({ modalLoading: true }, () => {
			this.savePlan();
		});
	};

	handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ newName: e.target.value });
	};

	handleModalCancel = () => {
		this.setState({ modalVisible: false });
	};

	handleSave = (e: any) => {
		this.setState({ modalVisible: true });
	};

	render() {
		let {
			modalVisible,
			modalLoading,
			fanCurves,
			newName,
			currentPlanName,
			plan,
		} = this.state;
		return (
			<div>
				<PageHeader
					title="Fan Curve Editor"
					subTitle="Modify fan speed configuration."
					style={{ width: '100%', height: '6rem' }}>
					<div className="curveplan-container">
						<Select
							defaultSelect={currentPlanName}
							selectables={fanCurves}
							handleChange={this.chooseFanCurveThing}></Select>
						<Button
							className="deleteplan-button"
							style={{ display: 'block' }}
							title="Will delete the currently selected plan."
							onClick={this.deletePlan}>
							Delete Plan
						</Button>
						<Button
							style={{
								display: 'block',
								position: 'absolute',
								right: 0,
								marginTop: '8rem',
							}}
							onClick={(e) => this.handleSubmitCurves(e)}>
							Apply
						</Button>
						<Button
							style={{
								right: 0,
								position: 'absolute',
								marginTop: '10.8rem',
								display: 'block',
							}}
							onClick={(e) => this.handleSave(e)}>
							Save Configuration
						</Button>
					</div>
				</PageHeader>
				<Card
					bordered
					headStyle={{ backgroundColor: '#FAFAFA' }}
					title="Armory Crate Plans"
					style={{ width: '70%' }}>
					<div
						style={{
							display: 'flex',
							justifyContent: 'start',
							paddingLeft: '2rem',
						}}>
						<ArmoryPlanSettings
							currentPlan={plan}
							selectPlan={this.selectArmoryPlan}></ArmoryPlanSettings>
					</div>
				</Card>

				<div style={{ height: '1rem', width: '100%' }} />
				<canvas id="fanCurveChartCPU" className="Charto"></canvas>
				<canvas id="fanCurveChartGPU" className="Charto"></canvas>
				<div style={{ margin: '1rem' }}></div>
				<Modal
					visible={modalVisible}
					title="Save Fan Configuration"
					onOk={this.handleModalOk}
					onCancel={this.handleModalCancel}
					footer={[
						<Button key="back" onClick={this.handleModalCancel}>
							Cancel
						</Button>,
						<Button
							key="submit"
							type="primary"
							loading={modalLoading}
							onClick={this.handleModalOk}>
							Submit
						</Button>,
					]}>
					<div>Configuration Name:</div>

					<Input
						type="text"
						title="Configuration Name:"
						aria-label="Configuration Name"
						value={newName}
						onChange={(e) => this.handleChangeName(e)}></Input>
				</Modal>
			</div>
		);
	}
}

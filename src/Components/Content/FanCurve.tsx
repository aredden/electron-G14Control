/** @format */

import React, { Component } from 'react';
import cjs, { Chart } from 'chart.js';
import * as dragData from 'chartjs-plugin-dragdata';
import { buildDataSet, createChart } from './FanCurve/FanCurveChartConfig';
import {
	Button,
	Card,
	Input,
	message,
	Modal,
	PageHeader,
	Tag,
	Form,
} from 'antd';
import ArmoryPlanSettings from './FanCurve/ArmoryPlan';
import {
	store,
	updateCurrentConfig,
	updateFanConfig,
} from '../../Store/ReduxStore';
import Select from './FanCurve/Select';
import './FanCurve.scss';
import { FanCurveModal } from './FanCurve/FanCurvePopper';
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
	modalVisible: boolean;
	modalLoading: boolean;
	newName: string;
	armoury: ArmoryPlan;
	armouryActive: boolean;
	validHelp: string;
	validStatus: '' | 'success' | 'warning' | 'error' | 'validating' | undefined;
}

export default class FanCurve extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let currentState = store.getState() as G14Config;

		// Is armory plan active?
		// let arm = currentState.current.fanCurve.type;

		// Find armoury plan only if armoury plan not active.
		let val = currentState.fanCurves.find((value) => {
			let { name } = value,
				{ current } = currentState;
			return name === current.fanCurve.name;
		}) as
			| { name: string; plan: ArmoryPlan; cpu: number[]; gpu: number[] }
			| undefined;

		// Placeholders if plan not armoury.
		let cpu: Array<number> = [],
			gpu: Array<number> = [],
			name = '',
			armplan = 'silent' as ArmoryPlan;
		if (val) {
			cpu = val.cpu;
			gpu = val.gpu;
			name = val.name;
			armplan = val.plan;
		} else {
			armplan = currentState.armouryPlan;
		}

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
			modalVisible: false,
			modalLoading: false,
			newName: '',
			armoury: armplan,
			armouryActive: true,
			validHelp: '',
			validStatus: '',
		};
	}

	deletePlan = () => {
		let { currentCurves, fanCurves, currentPlanName } = this.state;
		let reduxState = store.getState() as G14Config;
		let planChoiceInG14ControlPlans = reduxState.plans.find(
			(pln) => pln.fanCurve === currentPlanName
		);
		if (planChoiceInG14ControlPlans) {
			message.error(
				'Cannot delete a fan curve that is a part of a G14Control Plan!'
			);
			return;
		}
		if (reduxState.current.fanCurve.name === currentPlanName) {
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
				currentPlanName = newFanCurves[0].name;
				store.dispatch(updateFanConfig(newFanCurves));
				this.setState(
					{
						fanCurves: newFanCurves,
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
		let { currentCurves, fanCurves, newName, armoury } = this.state;
		let { cpu, gpu } = currentCurves;
		let newFanConfigOption: FanCurveConfig = {
			name: newName,
			cpu: cpu,
			plan: armoury,
			gpu: gpu,
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
		this.setState({
			armoury: (plan + '') as ArmoryPlan,
			armouryActive: true,
		});
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
		let { armoury, currentCurves } = this.state;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		window.ipcRenderer
			.invoke('setFanCurve', {
				...currentCurves,
				plan: armoury,
			})
			.then((result: any) => {
				if (result) {
					let state = store.getState() as G14Config;
					store.dispatch(
						updateCurrentConfig({
							ryzenadj: state.current.ryzenadj,
							fanCurve: {
								type: 'Custom',
								name: this.state.currentPlanName,
							},
						})
					);
					message.success('Sucessfully set fan curve.');
					this.setState({ armouryActive: true });
				} else {
					message.success('Failed to set fan curve.');
				}
			})
			.catch((error: any) => {
				message.error('Failed to set fan curves because of error. Check Logs.');
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
			let { cpu, gpu } = chosen;
			let cpuc = buildDataSet([...cpu], 'fanCurveChartCPU');
			let gpuc = buildDataSet([...gpu], 'fanCurveChartGPU');
			//@ts-ignore
			charts.cpu.config.data.datasets = cpuc;
			//@ts-ignore
			charts.gpu.config.data.datasets = gpuc;
			charts.cpu.update();
			charts.gpu.update();
			this.setState({
				currentPlanName: chosen.name,
				currentCurves: { cpu: [...cpu], gpu: [...gpu] },
				armoury: chosen.plan as ArmoryPlan,
			});
		}
	};

	handleModalOk = () => {
		let { newName, fanCurves } = this.state;
		let names = fanCurves.map((plan) => plan.name);
		if (names.includes(newName)) {
			this.setState({
				validHelp: 'Fan curve names must be unique.',
				validStatus: 'error',
			});
			return;
		} else if (newName === '') {
			this.setState({
				validHelp: 'Fan curve name cannot be empty.',
				validStatus: 'error',
			});
			return;
		} else {
			this.setState({ modalLoading: true }, () => {
				this.savePlan();
			});
		}
	};

	handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ newName: e.target.value, validHelp: '', validStatus: '' });
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
			armoury,
			armouryActive,
			validHelp,
			validStatus,
			currentCurves,
		} = this.state;

		let notCustom = false;

		if (currentPlanName === '' || currentCurves.cpu.length < 8) {
			notCustom = true;
		}

		return (
			<div>
				<PageHeader
					title="Fan Curve Editor"
					subTitle={
						<>
							<div style={{ width: '20rem', display: 'flex' }}>
								Modify fan speed configuration.
							</div>
							<FanCurveModal />
						</>
					}
					style={{ width: '100%', height: '6rem' }}>
					<div className="curveplan-container">
						<Select
							defaultSelect={currentPlanName}
							selectables={fanCurves}
							handleChange={this.chooseFanCurveThing}></Select>
						<Button
							disabled={notCustom}
							className="deleteplan-button"
							style={{ display: 'block' }}
							title="Will delete the currently selected plan."
							onClick={this.deletePlan}>
							Delete Plan
						</Button>
						<Button
							disabled={notCustom}
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
							disabled={notCustom}
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
					title={
						<div style={{ width: '100%' }}>
							Armoury Crate Plans
							{!armouryActive && armoury === 'silent' ? (
								<Tag style={{ marginLeft: '.2rem' }} title="" color="warning">
									CPU may be throttling, last plan: "Silent"
								</Tag>
							) : (
								''
							)}
						</div>
					}
					style={{ width: '70%' }}>
					<div
						style={{
							display: 'flex',
							justifyContent: 'start',
							paddingLeft: '2rem',
						}}>
						<ArmoryPlanSettings
							armouryActive={armouryActive}
							currentPlan={armouryActive ? armoury : undefined}
							selectPlan={this.selectArmoryPlan}
							currentFan={currentPlanName}></ArmoryPlanSettings>
					</div>
				</Card>

				<div style={{ height: '1rem', width: '100%' }} />
				<canvas
					style={{ visibility: notCustom ? 'hidden' : 'visible' }}
					id="fanCurveChartCPU"
					className="Charto"></canvas>
				<canvas
					style={{ visibility: notCustom ? 'hidden' : 'visible' }}
					id="fanCurveChartGPU"
					className="Charto"></canvas>
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
					<Form>
						<Form.Item validateStatus={validStatus} help={validHelp}>
							<Input
								type="text"
								title="Configuration Name:"
								aria-label="Configuration Name"
								value={newName}
								onChange={(e) => this.handleChangeName(e)}></Input>
						</Form.Item>
					</Form>
				</Modal>
			</div>
		);
	}
}

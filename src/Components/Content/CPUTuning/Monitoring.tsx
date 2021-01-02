/** @format */

import {
	Space,
	Switch,
	List,
	Divider,
	Row,
	Col,
	Statistic,
	PageHeader,
} from 'antd';
import React, { Component } from 'react';
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faBolt,
	faStopwatch,
	faTemperatureHigh,
} from '@fortawesome/free-solid-svg-icons';
import CCX from './CCX';
interface Props {}
interface State {
	smuData: SMUData[];
	listening: boolean;
}

const PerCoreTemps = [
	'CORE TEMP 0',
	'CORE TEMP 1',
	'CORE TEMP 2',
	'CORE TEMP 3',
	'CORE TEMP 4',
	'CORE TEMP 5',
	'CORE TEMP 6',
	'CORE TEMP 7',
];

const PerCoreFreq = [
	'CORE FREQ 0',
	'CORE FREQ 1',
	'CORE FREQ 2',
	'CORE FREQ 3',
	'CORE FREQ 4',
	'CORE FREQ 5',
	'CORE FREQ 6',
	'CORE FREQ 7',
];

let DAT = {
	'STAPM LIMIT': {
		name: 'TDP',
		value: 0,
		limit: 0,
	},
	'PPT LIMIT FAST': {
		name: 'Fastest Boost TDP',
		value: 0,
		limit: 0,
	},
	'PPT LIMIT SLOW': {
		name: 'Post-Boost TDP',
		value: 0,
		limit: 0,
	},
	'THM LIMIT CORE': {
		name: 'Temp Limit',
		value: 0,
		limit: 0,
	},
	StapmTimeConstant: {
		name: 'Post-Boost Duration',
		value: 0,
	},
	SlowPPTTimeConstant: {
		name: 'Fastest Boost Duration',
		value: 0,
	},
	'CORE TEMP ': {
		name: 'Per Core Temps',
		values: [0, 0, 0, 0, 0, 0, 0, 0],
	},
	'CORE FREQ ': {
		name: 'Per Core Frequencies (GHz)',
		values: [0, 0, 0, 0, 0, 0, 0, 0],
	},
};

const resetDat = () => {
	DAT = {
		'STAPM LIMIT': {
			name: 'TDP',
			value: 0,
			limit: 0,
		},
		'PPT LIMIT FAST': {
			name: 'Fastest Boost TDP',
			value: 0,
			limit: 0,
		},
		'PPT LIMIT SLOW': {
			name: 'Post-Boost TDP',
			value: 0,
			limit: 0,
		},
		'THM LIMIT CORE': {
			name: 'Temp Limit',
			value: 0,
			limit: 0,
		},
		StapmTimeConstant: {
			name: 'Post-Boost Duration',
			value: 0,
		},
		SlowPPTTimeConstant: {
			name: 'Fastest Boost Duration',
			value: 0,
		},
		'CORE TEMP ': {
			name: 'Per Core Temps',
			values: [0, 0, 0, 0, 0, 0, 0, 0],
		},
		'CORE FREQ ': {
			name: 'Per Core Frequencies (GHz)',
			values: [0, 0, 0, 0, 0, 0, 0, 0],
		},
	};
};

const coreMatcherThinger = (value: SMUData) => {
	if (PerCoreFreq.includes(value.description)) {
		let ok = value.description[value.description.length - 1];

		if (/[0-9]/.test(ok)) {
			DAT['CORE FREQ '].values[_.toNumber(ok)] = _.toNumber(value.value);
		}
	} else if (PerCoreTemps.includes(value.description)) {
		let ok = value.description[value.description.length - 1];
		if (/[0-9]/.test(ok)) {
			DAT['CORE TEMP '].values[_.toNumber(ok)] = _.toNumber(value.value);
		}
	}
};

export default class MonitoringList extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			smuData: [],
			listening: false,
		};
	}

	initMonitor = () => {
		let { listening } = this.state;
		if (!listening) {
			window.ipcRenderer.send('initMonitor');
			window.ipcRenderer.on('smuData', this.smuDataListener);
			this.setState({ listening: true });
		}
	};

	smuDataListener = (_evt: any, data: SMUData[]) => {
		if (data instanceof Array) {
			data.forEach((value) => {
				if (/^CORE/gi.test(value.description)) {
					coreMatcherThinger(value);
				} else if (/LIMIT/gi.test(value.description)) {
					//@ts-ignore
					DAT[value.description].limit = _.toNumber(value.value);
				} else if (/VALUE/gi.test(value.description)) {
					let { description } = value;
					let modDesc = description.replace('VALUE', 'LIMIT');
					//@ts-ignore
					DAT[modDesc].value = _.toNumber(value.value);
				} else {
					switch (value.description) {
						case 'StapmTimeConstant': {
							DAT['StapmTimeConstant'].value = _.toNumber(value.value);
							break;
						}
						case 'SlowPPTTimeConstant': {
							DAT['SlowPPTTimeConstant'].value = _.toNumber(value.value);
						}
					}
				}
			});
			this.forceUpdate();
		}
	};

	handleListen = (_evt: any) => {
		let { listening } = this.state;
		if (listening) {
			window.ipcRenderer.send('killMonitor');
			window.ipcRenderer.off('smuData', this.smuDataListener);
			resetDat();
			this.setState({ listening: false });
		} else {
			window.ipcRenderer.send('initMonitor');
			window.ipcRenderer.on('smuData', this.smuDataListener);
			this.setState({ listening: true });
		}
	};

	componentWillUnmount() {
		let { listening } = this.state;

		if (listening) {
			window.ipcRenderer.send('killMonitor');
			window.ipcRenderer.off('smuData', this.smuDataListener);
		}
		resetDat();
	}

	render() {
		let { listening } = this.state;

		let rimp = (
			<>
				<Row
					style={{
						display: 'flex',
						width: '100%',
						justifyContent: 'space-between',
						height: '5rem',
						textAlign: 'center',
					}}>
					<Col span={6}>
						<Statistic
							title={DAT['PPT LIMIT FAST'].name}
							value={
								DAT['PPT LIMIT FAST'].value.toFixed(2) +
								'/' +
								DAT['PPT LIMIT FAST'].limit.toFixed(0)
							}
							suffix={<FontAwesomeIcon icon={faBolt} />}
						/>
					</Col>
					<Col span={6}>
						<Statistic
							title={DAT['PPT LIMIT SLOW'].name}
							value={
								DAT['PPT LIMIT SLOW'].value.toFixed(2) +
								'/' +
								DAT['PPT LIMIT SLOW'].limit.toFixed(0)
							}
							suffix={<FontAwesomeIcon icon={faBolt} />}
						/>
					</Col>
					<Col span={6}>
						<Statistic
							title={DAT['STAPM LIMIT'].name}
							value={
								DAT['STAPM LIMIT'].value.toFixed(2) +
								'/' +
								DAT['STAPM LIMIT'].limit.toFixed(0)
							}
							suffix={<FontAwesomeIcon icon={faBolt} />}
						/>
					</Col>
				</Row>
			</>
		);

		let vals = _.chunk(
			DAT['CORE TEMP '].values.map((val, idx) => {
				return {
					label: 'Core ' + idx,
					value: val,
					speed: DAT['CORE FREQ '].values[idx],
				};
			}),
			4
		);

		return (
			<>
				<PageHeader
					title="RyzenADJ CPU Tuning"
					subTitle="Modify CPU performance limits."></PageHeader>
				<br></br>
				<List
					className="smu-list monitor-list"
					size="small"
					header={
						<div
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'space-between',
							}}>
							<div style={{ width: '20%', fontWeight: 'bold' }}>
								SMU Monitoring
							</div>
							<Space
								style={{
									display: 'flex',
									justifyContent: 'end',
									textAlign: 'center',
								}}
								direction="horizontal">
								<label>Enabled</label>
								<Switch
									checked={listening}
									onClick={this.handleListen}></Switch>
							</Space>
						</div>
					}
					bordered>
					<List.Item style={{ border: 'none', height: '7rem' }}>
						{rimp}
					</List.Item>
					<List.Item style={{ border: 'none', height: '6rem' }}>
						<Row
							style={{
								height: '7rem',
								display: 'flex',
								width: '100%',
								textAlign: 'center',
								justifyContent: 'space-between',
							}}>
							{' '}
							<Col span={6}>
								{' '}
								<Statistic
									title={DAT['SlowPPTTimeConstant'].name}
									value={DAT['SlowPPTTimeConstant'].value.toFixed(0)}
									suffix={<FontAwesomeIcon icon={faStopwatch} />}
								/>
							</Col>
							<Col span={6}>
								{' '}
								<Statistic
									title={DAT['StapmTimeConstant'].name}
									value={DAT['StapmTimeConstant'].value.toFixed(0)}
									suffix={<FontAwesomeIcon icon={faStopwatch} />}
								/>
							</Col>
							<Col span={6}>
								{' '}
								<Statistic
									title={DAT['THM LIMIT CORE'].name}
									value={
										DAT['THM LIMIT CORE'].value.toFixed(0) +
										'/' +
										DAT['THM LIMIT CORE'].limit
									}
									suffix={<FontAwesomeIcon icon={faTemperatureHigh} />}
								/>
							</Col>
						</Row>
					</List.Item>
					<List.Item style={{ border: 'none', paddingTop: '0rem' }}>
						<CCX values={vals[0]} />
						<CCX values={vals[1]} />
					</List.Item>
				</List>
				<Divider dashed type="horizontal"></Divider>
			</>
		);
	}
}

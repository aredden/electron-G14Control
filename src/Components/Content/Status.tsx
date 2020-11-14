/** @format */

import { Descriptions, Spin } from 'antd';
import React, { Component } from 'react';
import './Status.scss';

type SoftwareMap = Map<string, Map<string, string>>;
type CpuBiosMap = Map<string, string>;

interface Props {}

interface State {
	loadValues: Array<{ Name: string; PercentProcessorTime: number }>;
	cpubiosmap: CpuBiosMap | undefined;
	softwaremap: SoftwareMap | undefined;
}

export default class Status extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			loadValues: [],
			cpubiosmap: undefined,
			softwaremap: undefined,
		};
	}

	coreLoadListener = (
		_event: any,
		loadvalues: Array<{ Name: string; PercentProcessorTime: number }>
	) => {
		let newloadValues = loadvalues.sort((a, b) => {
			return parseFloat(a.Name) - parseFloat(b.Name);
		});
		this.setState({ loadValues: newloadValues });
	};

	getInfo = async () => {
		let info: Promise<CpuBiosMap> = window.ipcRenderer.invoke('getCpuBiosInfo');
		let software: Promise<SoftwareMap> = window.ipcRenderer.invoke(
			'getAsusPrograms'
		);

		Promise.all([info, software]).then(([cpubios, softmap]) => {
			this.setState({ cpubiosmap: cpubios, softwaremap: softmap });
		});
	};

	componentDidMount() {
		window.ipcRenderer.send('cpuLoadRun', true);
		window.ipcRenderer.on('coresLoad', this.coreLoadListener);
		this.getInfo();
	}

	componentWillUnmount() {
		window.ipcRenderer.send('cpuLoadRun', false);
		window.ipcRenderer.off('coresLoad', this.coreLoadListener);
	}

	render() {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		let { loadValues, cpubiosmap, softwaremap } = this.state;
		let descriptionBiosItems: Array<JSX.Element> = [];
		let descriptionSoftwareItems: Array<JSX.Element> = [];
		if (cpubiosmap) {
			Array.from(cpubiosmap).forEach((val, key) => {
				if (!val) {
					return;
				}
				let descitem = (
					<>
						<Descriptions.Item span={5} key={key} label={val[0]}>
							{val[1]}
						</Descriptions.Item>
					</>
				);
				descriptionBiosItems.push(descitem);
			});
		} else {
			descriptionBiosItems.push(
				<Spin tip="Loading CPU & BIOS info..." size="large" />
			);
		}
		if (softwaremap) {
			Array.from(softwaremap).forEach(([keyo, mapo], key) => {
				if (mapo) {
					let descitem = (
						<>
							<Descriptions.Item
								className="desc-item-row"
								span={5}
								key={key}
								label={keyo}>
								<div className="desc-item-ver-vend">{mapo.get('Version')}</div>

								<div className="desc-item-ver-vend">{mapo.get('Vendor')}</div>
							</Descriptions.Item>
						</>
					);
					descriptionSoftwareItems.push(descitem);
				}
			});
		} else {
			descriptionSoftwareItems.push(
				<Spin tip="Loading Software info..." size="large" />
			);
		}

		return (
			<>
				<Descriptions title="Cpu Info" bordered>
					{descriptionBiosItems}
				</Descriptions>
				<Descriptions bordered style={{ maxWidth: '100%' }}></Descriptions>
				<br></br>
				<Descriptions
					title="ASUS & AMD Software Info"
					style={{ maxWidth: '100%' }}
					bordered>
					<Descriptions.Item className="desc-item-row" span={5} label="Name">
						<div
							style={{ padding: '2rem', backgroundColor: '#FAFAFA' }}
							className="desc-item-ver-vend">
							Version
						</div>

						<div
							style={{ padding: '2rem', backgroundColor: '#FAFAFA' }}
							className="desc-item-ver-vend">
							Vendor
						</div>
					</Descriptions.Item>

					{descriptionSoftwareItems}
				</Descriptions>
			</>
		);
	}
}

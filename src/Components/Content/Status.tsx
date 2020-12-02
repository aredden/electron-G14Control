/** @format */

import {
	Button,
	Descriptions,
	PageHeader,
	Skeleton,
	Space,
	Spin,
	Table,
} from 'antd';
import React, { Component } from 'react';
import './Status.scss';
import CurrentConfiguration from './Status/CurrentConfiguration';
type SoftwareMap = Map<string, Map<string, string>>;
type CpuBiosMap = Map<string, string>;
type DriverMap = Map<string, string>;
interface Props {}

interface State {
	loadValues: Array<{ Name: string; PercentProcessorTime: number }>;
	cpubiosmap: CpuBiosMap | undefined;
	softwaremap: SoftwareMap | undefined;
	driverMap: DriverMap | undefined;
	loading: boolean;
}

export default class Status extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			loadValues: [],
			cpubiosmap: undefined,
			softwaremap: undefined,
			driverMap: undefined,
			loading: true,
		};
	}

	getInfo = async () => {
		let info: Promise<CpuBiosMap> = window.ipcRenderer.invoke('getCpuBiosInfo');
		let software: Promise<SoftwareMap> = window.ipcRenderer.invoke(
			'getAsusPrograms'
		);
		let drivers: Promise<Map<string, string>> = window.ipcRenderer.invoke(
			'getDrivers'
		);

		Promise.all([info, software, drivers]).then(
			([cpubios, softmap, drivermap]) => {
				this.setState({
					cpubiosmap: cpubios,
					softwaremap: softmap,
					driverMap: drivermap,
					loading: false,
				});
			}
		);
	};

	refreshEverything = () => {
		this.setState({ loading: true, driverMap: undefined });
		window.ipcRenderer
			.invoke('refreshStatus')
			.then(
				(response: {
					cpubios: CpuBiosMap;
					software: SoftwareMap;
					drivers: DriverMap;
				}) => {
					this.setState({
						cpubiosmap: response.cpubios,
						softwaremap: response.software,
						driverMap: response.drivers,
						loading: false,
					});
				}
			);
	};

	componentDidMount() {
		this.getInfo();
	}

	componentWillUnmount() {}

	render() {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		let { cpubiosmap, softwaremap, loading } = this.state;
		let descriptionBiosItems: Array<JSX.Element> = [];
		let descriptionSoftwareItems: Array<JSX.Element> = [];
		if (cpubiosmap && !loading) {
			Array.from(cpubiosmap).forEach((val, key) => {
				if (!val) {
					return;
				}
				let descitem = (
					<Descriptions.Item span={3} key={val[0] + key} label={val[0]}>
						{val[1]}
					</Descriptions.Item>
				);
				descriptionBiosItems.push(descitem);
			});
		} else {
			for (let x = 0; x < 10; x++) {
				descriptionBiosItems.push(
					<Descriptions.Item
						span={3}
						style={{ paddingTop: '1rem !important' }}
						key={'skeloitem' + x}
						label={
							<Skeleton
								title={false}
								active={true}
								key={'skellabel' + x}
								paragraph={{ width: Math.random() * 150 + 50, rows: 1 }}
							/>
						}>
						<Skeleton
							key={'skeldata' + x}
							title={false}
							active={true}
							paragraph={{ width: Math.random() * 100 + 100, rows: 1 }}
						/>
					</Descriptions.Item>
				);
			}
		}
		if (softwaremap && !loading) {
			Array.from(softwaremap).forEach(([keyo, mapo], key) => {
				if (mapo) {
					let descitem = (
						<>
							<Descriptions.Item
								className="desc-item-row"
								span={3}
								key={key + keyo + 'descSoft'}
								label={keyo}>
								<div key={key + keyo + 'vers'} className="desc-item-ver-vend">
									{mapo.get('Version')}
								</div>

								<div key={key + keyo + 'vend'} className="desc-item-ver-vend">
									{mapo.get('Vendor')}
								</div>
							</Descriptions.Item>
						</>
					);
					descriptionSoftwareItems.push(descitem);
				}
			});
		} else {
			for (let x = 0; x < 6; x++) {
				descriptionSoftwareItems.push(
					<Descriptions.Item
						className="desc-item-row"
						span={3}
						key={'skeleton' + x}
						label={
							<Skeleton
								key={'sekelLabel' + x}
								title={false}
								active={true}
								paragraph={{ width: Math.random() * 125 + 100, rows: 1 }}
							/>
						}>
						<div key={'sekelcontain' + x} className="desc-item-ver-vend">
							<Skeleton
								key={'sekelval' + x}
								title={false}
								active={true}
								paragraph={{ width: Math.random() * 100 + 50, rows: 1 }}
							/>
						</div>

						<div key={'sekelcontainver' + x} className="desc-item-ver-vend">
							<Skeleton
								key={'sekelver' + x}
								title={false}
								active={true}
								paragraph={{ width: Math.random() * 100 + 50, rows: 1 }}
							/>
						</div>
					</Descriptions.Item>
				);
			}
		}

		let { driverMap } = this.state;
		let drivers = <div />;
		if (driverMap) {
			let rows: Array<{ name: string; value: string }> = [];
			let columns = [
				{
					dataIndex: 'name',
					title: 'Driver',
				},
				{
					dataIndex: 'value',
					title: 'Version',
				},
			];

			Array.from(driverMap).forEach(([key, version], idx) => {
				rows.push({ name: key, value: version });
			});
			rows.sort((a, b) => {
				let aname = a.name.toUpperCase();
				let bname = b.name.toUpperCase();

				return aname > bname ? 1 : aname < bname ? -1 : 0;
			});

			drivers = <Table bordered columns={columns} dataSource={rows} />;
		}

		return (
			<>
				<Space
					size="middle"
					direction="vertical"
					style={{ width: '90%', marginLeft: '5%' }}>
					<PageHeader
						style={{
							fontWeight: 'bold',
							marginBottom: '0rem',
							paddingBottom: '.3rem',
						}}
						title={<div style={{ fontWeight: 'bold' }}>G14Control Status</div>}
						subTitle="Current configuration & laptop details"></PageHeader>

					<CurrentConfiguration></CurrentConfiguration>
					<Button
						className="refresh-hardware-btn"
						size="small"
						title="Refresh Software, Drivers, And Hardware Information"
						onClick={this.refreshEverything}>
						{loading ? (
							<Spin
								size="small"
								style={{
									display: 'flex',
									bottom: '7px',
									position: 'relative',
								}}
								spinning={true}
							/>
						) : (
							'Refresh'
						)}
					</Button>
					<Descriptions
						title={
							<div style={{ marginLeft: '5%', fontWeight: 'bold' }}>
								Laptop Hardware Information
							</div>
						}
						size="small"
						bordered>
						{descriptionBiosItems}
					</Descriptions>
					{drivers}
					<Descriptions
						title={
							<div style={{ marginLeft: '5%', fontWeight: 'bold' }}>
								AMD & ASUS Software Information
							</div>
						}
						style={{ maxWidth: '100%' }}
						bordered>
						<Descriptions.Item className="desc-item-row" span={3} label="Name">
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
				</Space>
			</>
		);
	}
}

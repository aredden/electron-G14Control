/** @format */

import { Descriptions, PageHeader, Skeleton, Space } from 'antd';
import React, { Component } from 'react';
import './Status.scss';
import CurrentConfiguration from './Status/CurrentConfiguration';
type SoftwareMap = Map<string, Map<string, string>>;
type CpuBiosMap = Map<string, string>;

interface Props {}

interface State {
	loadValues: Array<{ Name: string; PercentProcessorTime: number }>;
	cpubiosmap: CpuBiosMap | undefined;
	softwaremap: SoftwareMap | undefined;
	loading: boolean;
}

export default class Status extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			loadValues: [],
			cpubiosmap: undefined,
			softwaremap: undefined,
			loading: true,
		};
	}

	getInfo = async () => {
		let info: Promise<CpuBiosMap> = window.ipcRenderer.invoke('getCpuBiosInfo');
		let software: Promise<SoftwareMap> = window.ipcRenderer.invoke(
			'getAsusPrograms'
		);

		Promise.all([info, software]).then(([cpubios, softmap]) => {
			this.setState({
				cpubiosmap: cpubios,
				softwaremap: softmap,
				loading: false,
			});
		});
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

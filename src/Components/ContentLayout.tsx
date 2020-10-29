/** @format */

import { Layout } from 'antd';
import React, { Component } from 'react';
import { MenuListOption } from '../Utilities/Constants';
import AutoPowerSwitch from './Content/AutoPowerSwitch';
import Configuration from './Content/Configuration';
import CPUBoost from './Content/CPUBoost';
import DiscreteGPU from './Content/DiscreteGPU';
import WindowsPowerPlan from './Content/WindowsPowerPlan';

const { Header, Content, Footer } = Layout;

interface Props {
	currentPage: MenuListOption;
}

interface State {}

export default class ContentLayout extends Component<Props, State> {
	render() {
		let { currentPage } = this.props;
		let displayPage = <div />;
		switch (currentPage) {
			case 'Processor Boost':
				displayPage = <CPUBoost />;
				break;
			case 'Windows Power Plan':
				displayPage = <WindowsPowerPlan />;
				break;
			case 'Configuration':
				displayPage = <Configuration />;
				break;
			case 'Discrete GPU':
				displayPage = <DiscreteGPU />;
				break;
			case 'Auto Power Switching':
				displayPage = <AutoPowerSwitch />;
				break;
		}
		return (
			<Layout className="site-layout" style={{ marginLeft: 200 }}>
				<Header
					className="site-layout-background content-header"
					style={{ padding: 0 }}>
					{this.props.currentPage}
				</Header>
				<Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
					<div
						className="site-layout-background"
						style={{ padding: 24, textAlign: 'start' }}>
						{displayPage}
					</div>
				</Content>
				<Footer style={{ textAlign: 'center' }}>
					G14ControlR3 ©2020 Created by Zippy
				</Footer>
			</Layout>
		);
	}
}

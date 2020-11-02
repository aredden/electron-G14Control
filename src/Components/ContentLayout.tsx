/** @format */

import { Layout } from 'antd';
import React, { Component } from 'react';
import { MenuListOption } from '../Utilities/Constants';
import AutoPowerSwitch from './Content/AutoPowerSwitch';
import CPUTuning from './Content/CPUTuning';
import DiscreteGPU from './Content/DiscreteGPU';
import FanCurve from './Content/FanCurve';
import Status from './Content/Status';
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
			case 'Status':
				displayPage = <Status />;
				break;
			case 'Fan Curve Editor':
				displayPage = <FanCurve />;
				break;
			case 'Windows Power Plans':
				displayPage = <WindowsPowerPlan />;
				break;
			case 'CPU Tuning':
				displayPage = <CPUTuning />;
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

/** @format */

import { Affix, Layout } from 'antd';
import React, { Component } from 'react';
import { MenuListOption } from '../Utilities/Constants';
import AutoPowerSwitch from './Content/AutoPowerSwitch';
import Battery from './Content/Battery';
import CPUTuning from './Content/CPUTuning';
import DiscreteGPU from './Content/DiscreteGPU';
import FanCurve from './Content/FanCurve';
import G14ControlPlans from './Content/G14ControlPlans';
import Settings from './Content/Settings';
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
			case 'Battery':
				displayPage = <Battery />;
				break;
			case 'Settings':
				displayPage = <Settings />;
				break;
			case 'Plans':
				displayPage = <G14ControlPlans/>
				break;
		}
		return (
			<>
				<Layout
					className="site-layout"
					style={{ marginLeft: 200, height: 'auto' }}>
					<Affix offsetTop={16}>
						<Header className="show-dragarea content-header site-layout-background dragArea">
							{this.props.currentPage}
						</Header>
					</Affix>
					<div className="scroll-wrapper">
						<div className="scroll-content">
							<Content style={{ margin: '1rem 16px' }}>
								<div
									className="site-layout-background"
									style={{ padding: 24, textAlign: 'start' }}>
									{displayPage}
								</div>
							</Content>
							<Footer
								style={{
									textAlign: 'center',
									zIndex: -10,
									margin: '2rem 1rem',
									height: 'auto',
								}}>
								G14ControlV2 ©2020 Created by Alex Redden
								<br />
								Version 0.1.20
							</Footer>
						</div>
					</div>
				</Layout>
			</>
		);
	}
}

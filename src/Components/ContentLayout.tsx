/** @format */

import { Affix, Layout } from 'antd';
import React, { Component } from 'react';
import { MenuListOption } from '../Utilities/Constants';
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
	version: string;
}

interface State {
	curCurrentPage: MenuListOption;
}

export default class ContentLayout extends Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			curCurrentPage: 'Status',
		};
	}

	componentDidUpdate() {
		let { curCurrentPage } = this.state;
		let { currentPage } = this.props;
		if (curCurrentPage !== currentPage) {
			let scrollArea = document.getElementById('scroll-content');
			if (scrollArea) {
				scrollArea.scroll({
					top: 0,
					left: 0,
					behavior: 'smooth',
				});
				this.setState({ curCurrentPage: currentPage });
			}
		}
	}

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
			case 'Battery':
				displayPage = <Battery />;
				break;
			case 'Settings':
				displayPage = <Settings />;
				break;
			case 'Plans':
				displayPage = <G14ControlPlans />;
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
						<div className="scroll-content" id="scroll-content">
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
								G14ControlV2 ©2022 Created by Alex Redden
								<br />
								Version {this.props.version.replace('v', '')}
							</Footer>
						</div>
					</div>
				</Layout>
			</>
		);
	}
}

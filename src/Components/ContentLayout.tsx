/** @format */

import { Layout } from 'antd';
import React, { Component } from 'react';
import { MenuListOption } from '../Utilities/Constants';
import CPUBoost from './Content/CPUBoost';
import WindowsPowerPlan from './Content/WindowsPowerPlan';

const { Header, Content, Footer } = Layout;

interface Props {
	currentPage: MenuListOption;
}

interface State {}

export default class ContentLayout extends Component<Props, State> {
	render() {
		let { currentPage } = this.props;
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
						style={{ padding: 24, textAlign: 'center' }}>
						{currentPage === 'Windows Power Plan' ? (
							<WindowsPowerPlan />
						) : currentPage === 'Processor Boost' ? (
							<CPUBoost />
						) : (
							'ok'
						)}
					</div>
				</Content>
				<Footer style={{ textAlign: 'center' }}>
					G14ControlR3 ©2020 Created by Zippy
				</Footer>
			</Layout>
		);
	}
}

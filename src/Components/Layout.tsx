/** @format */

import React, { Component } from 'react';
import { Layout } from 'antd';
import './Layout.scss';
import SiderMenu from './Menu/SiderMenu';
import ContentLayout from './ContentLayout';
import { MenuInfo } from 'rc-menu/lib/interface';
import { MenuListMapper, MenuListOption } from '../Utilities/Constants';
import icn from './icon_light.png';
const { Sider, Header } = Layout;

interface Props {
	version: string;
}

interface State {
	currentSubMenu: MenuListOption;
}

export default class AppLayout extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			currentSubMenu: 'Status',
		};
	}

	onChooseSubmenu = (e: MenuInfo) => {
		this.setState({
			currentSubMenu: MenuListMapper[parseInt(e.key.toString())],
		});
	};

	render() {
		let { currentSubMenu } = this.state;
		return (
			<>
				<Layout className="layoutContainer">
					<Sider className="sider-main">
						<div className="logo" />
						<Header className="header-main">
							<img
								className="g14-icon-style"
								style={{
									marginLeft: '-1rem',
									marginTop: '-5px',
									width: '20px',
									height: '20px',
								}}
								src={icn}
								alt=""
							/>{' '}
							G14Control
						</Header>
						<SiderMenu onChooseSubmenu={this.onChooseSubmenu} />
					</Sider>
					<ContentLayout
						version={this.props.version}
						currentPage={currentSubMenu}
					/>
				</Layout>
			</>
		);
	}
}

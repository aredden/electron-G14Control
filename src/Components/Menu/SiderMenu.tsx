/** @format */

import React, { Component } from 'react';
import { Menu } from 'antd';
import { MenuInfo } from 'rc-menu/lib/interface';
import {
	BarChartOutlined,
	UserOutlined,
	WindowsOutlined,
	SettingOutlined,
	PictureOutlined,
	LineChartOutlined,
} from '@ant-design/icons';
import TempView from './TempView';

interface Props {
	onChooseSubmenu: (e: MenuInfo) => void;
}

interface State {
	selection: string;
}

export default class SiderMenu extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			selection: '0',
		};
	}

	handleClick = (e: MenuInfo) => {
		const { onChooseSubmenu } = this.props;
		onChooseSubmenu(e);
		this.setState({ selection: e.key.toString() });
	};

	render() {
		let { selection } = this.state;
		return (
			<Menu
				theme="dark"
				mode="inline"
				defaultSelectedKeys={[selection.toString()]}>
				<Menu.Item
					key="0"
					icon={<BarChartOutlined />}
					onClick={this.handleClick}>
					Status
				</Menu.Item>
				<Menu.Item
					key="1"
					icon={<LineChartOutlined />}
					onClick={this.handleClick}>
					Fan Curve Editor
				</Menu.Item>
				<Menu.Item
					key="2"
					icon={<PictureOutlined />}
					onClick={this.handleClick}>
					Discrete GPU
				</Menu.Item>
				<Menu.Item
					key="3"
					icon={<WindowsOutlined />}
					onClick={this.handleClick}>
					Windows Power Plans
				</Menu.Item>
				<Menu.Item key="4" icon={<UserOutlined />} onClick={this.handleClick}>
					Auto Power Switching
				</Menu.Item>
				<Menu.Item
					key="5"
					icon={<SettingOutlined />}
					onClick={this.handleClick}>
					CPU Tuning
				</Menu.Item>
				<TempView />
			</Menu>
		);
	}
}

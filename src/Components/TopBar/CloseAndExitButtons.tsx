/** @format */

import { Button, Select } from 'antd';
import React, { Component } from 'react';
import './CloseAndExitButtons.scss';
interface Props {}

interface State {}

export default class CloseAndExitButtons extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {};
	}

	handleExit = async () => {
		await window.ipcRenderer.send('cpuTempRun', false);
		window.ipcRenderer.invoke('exitWindow');
	};

	handleMinimize = async () => {
		let el = document.getElementById('menu-minimize') as HTMLButtonElement;
		el.blur();
		await window.ipcRenderer.send('cpuTempRun', false);
		window.ipcRenderer.invoke('minimizeWindow');
	};

	handleSelect = async (value: any, option: any) => {
		switch (value) {
			case 'exit':
				await window.ipcRenderer.invoke('exitApp');
				break;
			case 'logs':
				await window.ipcRenderer.invoke('openLogs');
				break;
		}
	};

	render() {
		return (
			<>
				<Select
					className="titlebar-menu-dropdown"
					placeholder="Menu"
					style={{ zIndex: 1000 }}
					optionLabelProp={'Menu'}
					defaultValue="Menu"
					value="Menu"
					dropdownClassName="titlebar-menu-dropdown-panel"
					onSelect={this.handleSelect}>
					<Select.Option title="Open Logs" value="logs">
						Open Logs
					</Select.Option>
					<Select.Option title="Exit App" value="exit">
						Exit App
					</Select.Option>
				</Select>
				<Button.Group className="close-exit-group">
					<Button id="menu-minimize" onClick={this.handleMinimize}>
						_
					</Button>
					<Button id="menu-exit" onClick={this.handleExit}>
						x
					</Button>
				</Button.Group>
			</>
		);
	}
}

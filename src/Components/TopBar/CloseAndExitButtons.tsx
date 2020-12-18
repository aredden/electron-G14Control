/** @format */

import { Button, message, Select } from 'antd';
import React, { Component, createRef } from 'react';
import './CloseAndExitButtons.scss';
import { store, updateStartOnBoot } from '../../Store/ReduxStore';
import { RefSelectProps } from 'antd/lib/select';
interface Props {}

interface State {
	launchEnabled: boolean;
	menuRef: React.Ref<RefSelectProps>;
}

export default class CloseAndExitButtons extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let stuff = store.getState() as G14Config;
		let enabled = stuff.startup.autoLaunchEnabled;
		this.state = {
			launchEnabled: enabled,
			menuRef: createRef(),
		};
	}

	handleExit = async () => {
		await window.ipcRenderer.send('cpuTempRun', false);
		window.ipcRenderer.invoke('exitWindow');
	};

	handleMinimize = async () => {
		let el = document.getElementById('menu-minimize') as HTMLButtonElement;
		el.blur();
		window.ipcRenderer.send('cpuTempRun', false);
		window.ipcRenderer.invoke('minimizeWindow');
	};

	handleMenuEvents = async () => {
		//@ts-ignore
	};

	handleSelect = async (value: any, option: any) => {
		switch (value) {
			case 'exit':
				await window.ipcRenderer.invoke('exitApp');
				break;
			case 'logs':
				await window.ipcRenderer.invoke('openLogs');
				break;
			case 'setBoot':
				let { launchEnabled } = this.state;
				store.dispatch(updateStartOnBoot(!launchEnabled));
				let state = store.getState() as G14Config;
				let result = await window.ipcRenderer.invoke(
					'setAutoLaunch',
					!launchEnabled,
					state
				);
				if (result) {
					message.success(
						`Successully ${
							!launchEnabled ? 'enabled' : 'disabled'
						} start on boot!`
					);
					this.setState({ launchEnabled: !launchEnabled });
				} else {
					message.error('There was trouble setting start on boot option.');
				}
				break;
			case 'imConf':
				window.ipcRenderer.send('importConfig');
				break;
			case 'exConf':
				window.ipcRenderer.send('exportConfig');
				break;
		}
	};

	render() {
		let { launchEnabled, menuRef } = this.state;
		return (
			<>
				<Select
					className="titlebar-menu-dropdown"
					placeholder="Menu"
					style={{ zIndex: 1000 }}
					optionLabelProp={'Menu'}
					defaultValue="Menu"
					ref={menuRef}
					value="Menu"
					onMouseLeave={this.handleMenuEvents}
					id="titlebar-dropdown-menu"
					dropdownClassName="titlebar-menu-dropdown-panel"
					onSelect={this.handleSelect}>
					<Select.Option title="Open Logs" value="logs">
						Open Logs
					</Select.Option>
					<Select.Option title="Start on boot" value="setBoot">
						{launchEnabled ? 'Disable start on boot' : 'Enable start on boot'}
					</Select.Option>
					<Select.Option title="Export Config" value="exConf">
						Export Config
					</Select.Option>
					<Select.Option title="Import Config" value="imConf">
						Import Config
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

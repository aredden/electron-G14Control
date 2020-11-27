/** @format */

import { Button } from 'antd';
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

	render() {
		return (
			<div>
				<Button.Group className="close-exit-group">
					<Button id="menu-minimize" onClick={this.handleMinimize}>
						_
					</Button>
					<Button id="menu-exit" onClick={this.handleExit}>
						x
					</Button>
				</Button.Group>
			</div>
		);
	}
}

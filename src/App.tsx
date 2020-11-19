/** @format */

import React, { Component } from 'react';
import './App.scss';
import 'antd';
import 'antd/dist/antd.css';
import AppLayout from './Components/Layout';
import { Spin } from 'antd';
import { initStore } from './Store/ReduxStore';
import { EnhancedStore } from '@reduxjs/toolkit';
import CloseAndExitButtons from './Components/TopBar/CloseAndExitButtons';
declare global {
	interface Window {
		require: any;
	}
}

interface Props {}

interface State {
	config: G14Config | undefined;
	store: EnhancedStore<G14Config> | undefined;
}

export default class App extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			config: undefined,
			store: undefined,
		};
	}

	loadConfig = async () => {
		let config = await window.ipcRenderer.invoke('loadConfig');
		if (config) {
			let parsedConfig: G14Config = JSON.parse(config);
			let store = await initStore(parsedConfig);
			this.setState({ config: config, store });
		}
	};

	componentDidMount() {
		this.loadConfig();
	}

	render() {
		let { config } = this.state;
		if (config) {
			return (
				<>
					<CloseAndExitButtons />
					<div className="scrollbehavior">
						<div
							id="topDrag"
							className="topDrag"
							style={{
								width: '90%',
								height: '20px',
							}}></div>

						<AppLayout></AppLayout>
					</div>
				</>
			);
		} else {
			return (
				<Spin
					spinning={true}
					size="large"
					style={{
						display: 'flex',
						justifyContent: 'center',
						marginTop: '20%',
						alignContent: 'center',
					}}></Spin>
			);
		}
	}
}

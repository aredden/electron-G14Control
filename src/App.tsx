/** @format */

import React, { Component, useEffect } from 'react';
import './App.scss';
import 'antd/dist/antd.css';
import AppLayout from './Components/Layout';
import { message, Modal, Spin } from 'antd';
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
	boostVisible: boolean;
	showModal: boolean;
}

export default class App extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			config: undefined,
			store: undefined,
			boostVisible: true,
			showModal: false,
		};
	}

	loadConfig = async () => {
		let config = await window.ipcRenderer.invoke('loadConfig');
		let { boostVisible } = this.state;
		if (config) {
			let parsedConfig: G14Config = JSON.parse(config);
			let store = await initStore(parsedConfig);
			//@ts-ignore
			if (parsedConfig.startup.checkBoostVisibility) {
				let result = await window.ipcRenderer.invoke('checkBoostVisibility');
				if (result !== 'error') {
					if (result) {
						message.success('Boost is visible on this machine.');
					} else {
						message.error("Boost isn't visible on this machine.");
						boostVisible = false;
					}
				} else {
					message.info('Boost registry check resulted in error. (non-fatal)');
				}
			}
			this.setState({
				config: config,
				store,
				boostVisible,
				showModal: !boostVisible,
			});
		}
	};

	componentDidMount() {
		this.loadConfig();
	}

	render() {
		let { config, boostVisible, showModal } = this.state;
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
					<BoostEnable {...{ boostVisible, show: showModal }}></BoostEnable>
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

const BoostEnable = (props: { boostVisible: boolean; show: boolean }) => {
	const [visible, setVisible] = React.useState(false);
	const [boostVisibleInternal, setBoostVisible] = React.useState(false);
	const [confirmLoading, setConfirmLoading] = React.useState(false);
	const [modalText, setModalText] = React.useState(
		'Would you like to enable boost visibility in registry?'
	);

	const handleOk = () => {
		setModalText('Enabling boost...');
		setConfirmLoading(true);
		window.ipcRenderer
			.invoke('enableBoostVisibility')
			.then((result: boolean) => {
				if (result) {
					message.success('Boost visibility successfully enabled!');
				} else {
					message.error('Failed to enable boost visibility :(');
				}
				setBoostVisible(true);
				setConfirmLoading(false);
				setVisible(false);
			});
	};

	const handleCancel = () => {
		setVisible(false);
		setBoostVisible(true);
	};

	const handleOpen = () => {
		if (!boostVisibleInternal) {
			setVisible(true);
		}
	};

	useEffect(() => {
		if (visible !== props.show) {
			handleOpen();
		}
	});

	return (
		<>
			<Modal
				title="Enable Boost Visibility"
				visible={visible}
				onOk={handleOk}
				confirmLoading={confirmLoading}
				onCancel={handleCancel}>
				<p>{modalText}</p>
			</Modal>
		</>
	);
};

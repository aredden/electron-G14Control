/** @format */

import React, { Component, useEffect } from 'react';
import './App.scss';
import 'antd/dist/antd.css';
import AppLayout from './Components/Layout';
import { message, Modal, Spin } from 'antd';
import { initStore, updateStore } from './Store/ReduxStore';
import { EnhancedStore } from '@reduxjs/toolkit';
import CloseAndExitButtons from './Components/TopBar/CloseAndExitButtons';
import { UpdateInfo } from 'electron-updater';
import ReactMarkdownWithHtml from 'react-markdown/with-html';

declare global {
	interface Window {
		ipcRenderer: Electron.IpcRenderer;
		shell: Electron.Shell;
		powerMonitor: Electron.PowerMonitor;
	}
}

interface Props {}

interface State {
	config: G14Config | undefined;
	store: EnhancedStore<G14Config> | undefined;
	boostVisible: boolean;
	showModal: boolean;
	updateText: string | undefined;
	updateVisible: boolean;
	version: string;
}

export default class App extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			config: undefined,
			store: undefined,
			boostVisible: true,
			showModal: false,
			updateText: '',
			updateVisible: false,
			version: '',
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

	getVersion = async () => {
		let version = await window.ipcRenderer.invoke('getVersion');
		this.setState({ version });
	};

	componentDidMount() {
		this.loadConfig();
		window.ipcRenderer.on('updateAvailable', this.handleUpdateAvailable);
		window.ipcRenderer.on('updateDownloaded', this.handleUpdateDownloaded);
		window.ipcRenderer.send('isLoaded');
		window.ipcRenderer.on('updateConfig', async (evt, newConfig: G14Config) => {
			await updateStore(newConfig);
		});
		this.getVersion();
	}

	handleUpdateAvailable = (evt: any, logs: UpdateInfo) => {
		message.info('New update available, downloading...');
		this.setState({
			updateText: (logs.releaseNotes as string).toString(),
		});
	};

	handleUpdateDownloaded = () => {
		message.info('New update downloaded!');
		this.setState({ updateVisible: true });
	};

	handleExitAndUpdate = () => {
		window.ipcRenderer.send('exitAndUpdate');
	};

	cancelExitAndUpdate = () => {
		this.setState({ updateVisible: false });
	};

	componentWillUnmount() {
		window.ipcRenderer.off('updateAvailable', this.handleUpdateAvailable);
		window.ipcRenderer.off('updateDownloaded', this.handleUpdateDownloaded);
	}

	render() {
		let { config, boostVisible, showModal, updateVisible, updateText } =
			this.state;
		if (config) {
			return (
				<>
					<CloseAndExitButtons />
					<div className="scrollbehavior">
						<div
							id="topDrag"
							className={`topDrag`}
							style={{
								width: '75%',
								height: '20px',
							}}></div>

						<AppLayout version={this.state.version}></AppLayout>
					</div>
					<BoostEnable {...{ boostVisible, show: showModal }}></BoostEnable>
					<Modal
						cancelText={'Update Later'}
						title="Update Downloaded"
						visible={updateVisible}
						onOk={this.handleExitAndUpdate}
						okText="Exit and Update"
						okButtonProps={{
							title: 'Exit and update when available',
						}}
						onCancel={this.cancelExitAndUpdate}>
						<ReactMarkdownWithHtml allowDangerousHtml>
							{updateText ? updateText : 'No release notes available.'}
						</ReactMarkdownWithHtml>
					</Modal>
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

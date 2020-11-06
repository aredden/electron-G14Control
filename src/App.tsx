/** @format */

import React, { Component } from 'react';
import './App.scss';
import 'antd/dist/antd.css';
import AppLayout from './Components/Layout';
declare global {
	interface Window {
		require: any;
	}
}

interface Props {}

interface State {
	config: any;
}

export default class App extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			config: {},
		};
	}

	loadConfig = async () => {
		let config = await window.ipcRenderer.invoke('loadConfig');
		if (config) {
			this.setState({ config: config });
		}
		console.log(config);
	};

	componentDidMount() {
		this.loadConfig();
	}
	render() {
		return (
			<div className="scrollbehavior">
				<div
					id="topDrag"
					className="topDrag"
					style={{
						width: '100%',
						height: '20px',
					}}></div>
				<AppLayout></AppLayout>
			</div>
		);
	}
}

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

interface State {}

export default class App extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<div className="App">
				<AppLayout></AppLayout>
			</div>
		);
	}
}

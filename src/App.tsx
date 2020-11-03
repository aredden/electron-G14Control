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

	componentDidMount() {}
	render() {
		return (
			<div className="App">
				<div
					id="dragArea"
					className="dragArea"
					style={{
						width: '100%',
						height: '20px',
						backgroundColor: '#001529',
						MozWindowDragging: 'drag',
					}}></div>
				<AppLayout></AppLayout>
			</div>
		);
	}
}

/** @format */

import React, { Component } from 'react';
import PlanTable from './WindowsPlanComponents/PlanTable';

declare global {
	interface Window {
		ipcRenderer: any;
	}
}
interface Props {}

interface State {
	plans: Array<{ name: string; guid: string }>;
	active: { name: string; guid: string };
}

export default class WindowsPowerPlan extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			plans: [],
			active: { name: '', guid: '' },
		};
	}

	winPlansListener = (
		event: any,
		data: Array<{ name: string; guid: string }>
	) => {
		this.setState({ plans: data });
	};

	activeWinPlanListener = (
		event: any,
		data: { name: string; guid: string }
	) => {
		this.setState({ active: data });
	};

	setActivePlanStatusListener = (
		event: any,
		info: { data: { name: string; guid: string }; result: boolean }
	) => {
		if (info.result) {
			this.setState({ active: info.data });
		}
	};

	componentDidMount() {
		// Send request for windows plans to electron main thread.
		window.ipcRenderer.send('getWindowsPlans');
		window.ipcRenderer.send('getActivePlan');

		// Listen for response from electron main thread.
		window.ipcRenderer.on('winplans', this.winPlansListener);
		window.ipcRenderer.on('activeplan', this.activeWinPlanListener);
		window.ipcRenderer.on(
			'setActivePlanStatus',
			this.setActivePlanStatusListener
		);
	}

	componentWillUnmount() {
		window.ipcRenderer.off(
			'setActivePlanStatus',
			this.setActivePlanStatusListener
		);
		window.ipcRenderer.off('winplans', this.winPlansListener);
		window.ipcRenderer.off('activeplan', this.activeWinPlanListener);
	}

	render() {
		let { plans, active } = this.state;
		return <div>{plans ? <PlanTable active={active} data={plans} /> : ''}</div>;
	}
}

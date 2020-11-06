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
		window.ipcRenderer.invoke('getWindowsPlans').then((result: any) => {
			if (result) {
				this.setState({ plans: result });
			} else {
				alert(
					'There was an issue getting your windows plans. Check the logs file for more details.'
				);
			}
		});
		window.ipcRenderer.invoke('getActivePlan').then((result: any) => {
			if (result) {
				this.setState({ active: result });
			} else {
				alert(
					'There was an issue getting your active windows plan. Check the logs file for more details.'
				);
			}
		});

		// Listen for response from electron main thread.
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
	}

	render() {
		let { plans, active } = this.state;
		return <div>{plans ? <PlanTable active={active} data={plans} /> : ''}</div>;
	}
}

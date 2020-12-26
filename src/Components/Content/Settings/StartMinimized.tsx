/** @format */

import { Card, Space } from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import React, { Component } from 'react';
import {
	setStartMinimized,
	setMinToTray,
	store,
} from '../../../Store/ReduxStore';

interface Props {}
interface State {
	startBoot: boolean;
	enabled: boolean;
	minToTray: boolean;
}

export default class StartMinimized extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let currentState = store.getState() as G14Config;
		let { startMinimized, autoLaunchEnabled } = currentState.startup;
		let { minToTray } = currentState.current;

		this.state = {
			startBoot: Boolean(startMinimized),
			enabled: autoLaunchEnabled,
			minToTray: Boolean(minToTray),
		};
	}
	handleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
		let { startBoot } = this.state;
		this.setState({ startBoot: !startBoot }, () => {
			store.dispatch(setStartMinimized(this.state.startBoot));
		});
	};

	handleMinToTray = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
		let { minToTray } = this.state;
		this.setState({ minToTray: !minToTray }, () => {
			store.dispatch(setMinToTray(this.state.minToTray));
		});
	};

	render() {
		let { startBoot, enabled, minToTray } = this.state;
		return (
			<>
				<Card>
					<Space direction="vertical">
						<Space direction="horizontal">
							<label>Minimize to tray (checked), or taskbar (unchecked)</label>
							<Checkbox checked={minToTray} onClick={this.handleMinToTray} />
						</Space>
						<Space direction="horizontal">
							<label>Start on boot minimized? &nbsp;</label>
							<Checkbox
								checked={startBoot}
								onClick={this.handleClick}
								disabled={!enabled}
							/>
						</Space>
					</Space>
				</Card>
			</>
		);
	}
}

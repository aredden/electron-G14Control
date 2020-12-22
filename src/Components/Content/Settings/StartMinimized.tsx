/** @format */

import { Card, Space } from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import React, { Component } from 'react';
import { setStartMinimized, store } from '../../../Store/ReduxStore';

interface Props {}
interface State {
	startBoot: boolean;
	enabled: boolean;
}

export default class StartMinimized extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let {
			startMinimized,
			autoLaunchEnabled,
		} = (store.getState() as G14Config).startup;
		this.state = {
			startBoot: Boolean(startMinimized),
			enabled: autoLaunchEnabled,
		};
	}
	handleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
		let { startBoot } = this.state;
		this.setState({ startBoot: !startBoot }, () => {
			store.dispatch(setStartMinimized(this.state.startBoot));
		});
	};
	render() {
		let { startBoot, enabled } = this.state;
		return (
			<>
				{enabled ? (
					<Card>
						<Space direction="horizontal">
							<label>Start on boot minimized? &nbsp;</label>
							<Checkbox checked={startBoot} onClick={this.handleClick} />
						</Space>
					</Card>
				) : (
					''
				)}
			</>
		);
	}
}

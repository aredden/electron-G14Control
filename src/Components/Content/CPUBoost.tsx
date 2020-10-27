/** @format */

import { Avatar, Card } from 'antd';
import Meta from 'antd/lib/card/Meta';
import React, { Component } from 'react';
import {
	SettingOutlined,
	EditOutlined,
	EllipsisOutlined,
} from '@ant-design/icons';
interface Props {}

interface State {
	currentBoost: { ac: string; dc: string };
}

export default class CPUBoost extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			currentBoost: { ac: '', dc: '' },
		};
	}

	getBoostListener = (
		_event: any,
		data: { ac: string; dc: string } | false
	) => {
		if (data) {
			this.setState({ currentBoost: data });
		}
	};

	componentDidMount() {
		window.ipcRenderer.send('getBoost');

		window.ipcRenderer.on('getBoostResult', (_event: any, result: any) => {
			console.log(_event, result);
			this.setState({ currentBoost: result });
		});
	}

	render() {
		let { currentBoost } = this.state;
		return (
			<div>
				{' '}
				<Card
					style={{ width: '100%' }}
					cover={
						<img
							alt="example"
							src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
						/>
					}
					actions={[
						<SettingOutlined key="setting" />,
						<EditOutlined key="edit" />,
						<EllipsisOutlined key="ellipsis" />,
					]}>
					<Meta
						avatar={
							<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
						}
						title="Here is boost bruh"
						description={JSON.stringify(currentBoost)}
					/>
				</Card>
			</div>
		);
	}
}

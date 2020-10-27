/** @format */

import React, { Component } from 'react';
import { Button, Table } from 'antd';
import createLogger from '../../../Logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = createLogger('PlanTable');

interface Props {
	data: Array<{ name: string; guid: string }>;
	active: { name: string; guid: string };
}

interface State {
	top: string;
	bottom: string;
	dataRows: Array<{ name: string; active: boolean }>;
}

export default class PlanTable extends Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			top: 'topLeft',
			bottom: 'bottomRight',
			dataRows: [],
		};
	}

	selectWindowsPlan = (
		e: React.MouseEvent<HTMLElement, MouseEvent>,
		record: { name: string; active: boolean }
	) => {
		let { data } = this.props;
		let val = data.find((val) => {
			return val.name === record.name;
		});
		val = val as { name: string; guid: string };
		window.ipcRenderer.send('setWindowsPlan', val);
	};

	buildDataRows = () => {
		let { data, active } = this.props;
		if (active) {
			let datarows = data.map((val) => {
				if (val.guid === active.guid) {
					return { name: val.name, active: true };
				} else {
					return { name: val.name, active: false };
				}
			});
			this.setState({ dataRows: datarows });
		}
	};

	componentDidUpdate() {
		if (this.state.dataRows.length === 0) {
			setTimeout(() => {
				this.buildDataRows();
			}, 100);
		}
	}

	componentDidMount() {
		this.buildDataRows();
	}

	render() {
		let { dataRows } = this.state;
		return (
			<>
				<Table
					pagination={false}
					rowKey={Math.floor(Math.random() * 100).toString()}
					dataSource={dataRows}>
					<Table.Column title="Name" dataIndex="name" key="namekey" />
					<Table.Column
						title="Active"
						dataIndex="active"
						key="namekey"
						render={(value: boolean, record, idx) => (
							<div key={'namekey' + idx}>{value ? 'Active' : 'Not Active'}</div>
						)}
					/>
					<Table.Column
						title="Activate"
						dataIndex="doit"
						key="activateplankey"
						render={(value, record: { name: string; active: boolean }, idx) => (
							<Button onClick={(e) => this.selectWindowsPlan(e, record)}>
								Clicko
							</Button>
						)}
					/>
				</Table>
			</>
		);
	}
}

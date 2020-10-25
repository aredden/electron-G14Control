/** @format */

import React, { Component } from 'react';
import { Table } from 'antd';

const columns = [
	{
		title: 'Name',
		dataIndex: 'name',
		key: 'nameKey',
	},
	{
		title: 'Active',
		dataIndex: 'active',
		key: 'activeKey',
		render: (value: boolean) => {
			return <div>{value ? 'Active' : 'Not Active'}</div>;
		},
	},
];

interface Props {
	data: Array<{ name: string; guid: string }>;
	active: { name: string; guid: string };
}

interface State {
	top: string;
	bottom: string;
	dataColumns: Array<{ name: string; active: boolean }>;
}

export default class PlanTable extends Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			top: 'topLeft',
			bottom: 'bottomRight',
			dataColumns: [],
		};
	}

	buildDataRows = () => {
		let { data, active } = this.props;
		if (active) {
			let newColumns = data.map((val) => {
				if (val.guid === active.guid) {
					return { name: val.name, active: true };
				} else {
					return { name: val.name, active: false };
				}
			});
			this.setState({ dataColumns: newColumns });
		}
	};

	componentDidUpdate() {
		if (this.state.dataColumns.length === 0) {
			setTimeout(() => {
				this.buildDataRows();
			}, 1000);
		}
	}

	componentDidMount() {
		this.buildDataRows();
	}

	render() {
		let { dataColumns } = this.state;
		return (
			<>
				<Table
					pagination={false}
					rowKey={Math.floor(Math.random() * 100).toString()}
					columns={columns}
					dataSource={dataColumns}
				/>
			</>
		);
	}
}

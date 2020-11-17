/** @format */

import { Button, PageHeader, Space, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React, { Component } from 'react';

interface Props {}

interface State {
	displayDataList: Array<DisplayOptionData>;
	isLoading: boolean;
}

type SortOrder = 'ascend' | 'descend' | undefined | null;

type DisplayOptionListType = {
	bits: number;
	refresh: number;
	format: string;
	resolution: string;
};

const calcResolutionSort = (
	a: DisplayOptionListType,
	b: DisplayOptionListType
) => {
	let numaarr = a.resolution.toString().match(/\d*x/) as RegExpMatchArray;
	let numbarr = b.resolution.toString().match(/\d*x/) as RegExpMatchArray;
	if (numaarr && numbarr) {
		return (
			-parseInt(numbarr[0].replace('x', '')) +
			parseInt(numaarr[0].replace('x', ''))
		);
	} else {
		return -1000;
	}
};

const calcRefreshSort = (
	a: DisplayOptionListType,
	b: DisplayOptionListType
) => {
	console.log(a, b);
	return (b.refresh as number) - (a.refresh as number);
};

const columns: ColumnsType<DisplayOptionListType> = [
	{
		title: 'Refresh Rate',
		key: 'refresh',
		dataIndex: 'refresh',
		sorter: {
			compare: calcRefreshSort,
			multiple: 2,
		},
	},
	{
		title: 'Resolution',
		key: 'resolution',
		dataIndex: 'resolution',
		sorter: {
			compare: calcResolutionSort,
			multiple: 2,
		},
		defaultSortOrder: 'descend' as SortOrder,
	},
	{
		title: 'Color Bits',
		key: 'bits',
		dataIndex: 'bits',
	},
	{
		title: 'Format',
		key: 'format',
		dataIndex: 'format',
	},
];

export default class DiscreteGPU extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			displayDataList: [],
			isLoading: true,
		};
	}

	handleClick = async () => {
		let result = await window.ipcRenderer.invoke('resetGPU');
		if (result) {
			alert('hmm');
		} else {
			alert('frick');
		}
	};

	getDisplayData = async () => {
		let displayData = await window.ipcRenderer.invoke('getDisplayOptions');
		if (displayData) {
			this.setState({ displayDataList: displayData, isLoading: false });
		}
	};

	componentDidMount() {
		this.getDisplayData();
	}

	render() {
		let { displayDataList, isLoading } = this.state;
		return (
			<div>
				<Space style={{ padding: '2rem' }}>
					<Button onClick={this.handleClick}>
						Reset GPU (or are you too scared? LOL noob)
					</Button>
				</Space>
				<PageHeader title="Display Options"></PageHeader>
				<Table<DisplayOptionListType>
					showSorterTooltip={true}
					loading={isLoading}
					size="small"
					dataSource={displayDataList.map((val) => {
						return {
							bits: val.bits,
							refresh: val.refresh,
							format: val.format,
							resolution: val.resolution.width + 'x' + val.resolution.height,
						};
					})}
					columns={columns}></Table>
			</div>
		);
	}
}

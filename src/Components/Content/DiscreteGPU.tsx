/** @format */

import { Button, message, PageHeader, Space, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React, { Component } from 'react';
import { CheckSquareOutlined } from '@ant-design/icons';
import { store, updateDisplayOptions } from '../../Store/ReduxStore';
import GraphicsSettings from './DiscreteGPU/GraphicsSettings';
import {
	calcRefreshSort,
	calcResolutionSort,
} from './DiscreteGPU/ResolutionSortingFunctions';
interface Props {}

interface State {
	displayDataList: Array<DisplayOptionData>;
	columns: ColumnsType<DisplayOptionListType>;
	popconfirm: boolean;
	targetDisplay: DisplayOptions;
}

type SortOrder = 'ascend' | 'descend' | undefined | null;

export default class DiscreteGPU extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			displayDataList: [],
			columns: [],
			popconfirm: false,
			targetDisplay: {
				refresh: 0,
				width: 1920,
				height: 1080,
				display: 0,
			},
		};
	}

	buildListOptions = () => {
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
			{
				title: 'Select',
				key: 'select',
				render: (val, record) => {
					return (
						<button
							color="#6C2626"
							onClick={() => this.handleCellClick(val, record)}>
							<CheckSquareOutlined />
						</button>
					);
				},
			},
		];
		return columns;
	};

	handleCellClick = (e: any, data: DisplayOptionListType) => {
		let [width, height] = data.resolution.split('x');
		let raw = {
			width: parseInt(width),
			height: parseInt(height),
			refresh: data.refresh,
			mode: data.format,
			display: 0,
		};

		this.setState({ targetDisplay: raw, popconfirm: true }, () => {
			this.handleConfirmChangeDisplay();
		});
	};

	handleClick = async () => {
		message.loading('Resetting GPU device.');
		window.ipcRenderer.invoke('resetGPU').then((result: any) => {
			if (result) {
				message.success('GPU reset successfully!');
			} else {
				message.error('GPU could not be reset.');
			}
		});
	};

	getDisplayData = async () => {
		let storeState = store.getState() as G14Config;
		if (storeState.displayOptions && storeState.displayOptions.length > 0) {
			let columns = this.buildListOptions();
			this.setState({
				displayDataList: [...storeState.displayOptions],
				columns,
			});
		} else {
			window.ipcRenderer.invoke('getDisplayOptions').then((result: any) => {
				if (result) {
					let columns = this.buildListOptions();
					store.dispatch(updateDisplayOptions(result));
					this.setState({ displayDataList: result, columns });
				}
			});
		}
	};

	handleConfirmChangeDisplay = async () => {
		message.loading('Modifying display settings.');
		window.ipcRenderer
			.invoke('setDisplayOptions', this.state.targetDisplay)
			.then((result: any) => {
				if (result) {
					message.success('Display settings successfully changed.');
				} else {
					message.error('Display settings change failed.');
				}
			})
			.catch((err: string) => {
				alert('SHIP' + err);
			});
	};

	componentDidMount() {
		this.getDisplayData();
	}

	render() {
		let { displayDataList, columns } = this.state;
		let datalist = displayDataList.map((val) => {
			return {
				bits: val.bits,
				refresh: val.refresh,
				format: val.format,
				resolution: val.resolution.width + 'x' + val.resolution.height,
			};
		});

		const headerStyles: React.CSSProperties = {
			marginLeft: '.9rem',
			marginTop: '-1rem',
			paddingLeft: '.8rem',
		};

		const tableStyles: React.CSSProperties = {
			width: '90%',
			marginLeft: '5%',
			marginTop: '1.5rem',
		};

		const toolsStyles: React.CSSProperties = {
			marginLeft: '.9rem',
			marginTop: '-.3rem',
			paddingLeft: '.8rem',
		};

		return (
			<div>
				<PageHeader
					style={headerStyles}
					title="Discrete GPU Tools"
					subTitle="Tools & Display Options"></PageHeader>
				<GraphicsSettings></GraphicsSettings>
				<Space direction="horizontal" style={{ marginTop: '-1rem' }}>
					<PageHeader style={toolsStyles} title="Tools" />
					<Button
						style={{ marginTop: '-2.5rem !important' }}
						onClick={this.handleClick}>
						Reset GPU
					</Button>
				</Space>
				<br style={{ height: '3rem' }}></br>
				<Space direction="vertical" style={tableStyles}>
					<PageHeader
						style={headerStyles}
						title="Display Options"
						subTitle="Modify refresh rate And resolution"></PageHeader>
					{datalist.length === 0 ? (
						''
					) : (
						<Table<DisplayOptionListType>
							showSorterTooltip={true}
							loading={datalist.length === 0}
							size="small"
							dataSource={datalist}
							columns={columns}></Table>
					)}
				</Space>
			</div>
		);
	}
}

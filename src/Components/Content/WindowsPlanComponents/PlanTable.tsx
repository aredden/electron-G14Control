/** @format */

import React, { Component } from 'react';
import { Button, Collapse, Tag } from 'antd';
import createLogger from '../../../Logger';
import { CaretRightFilled } from '@ant-design/icons';
import CPUBoost from '../CPUBoost';

const { Panel } = Collapse;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = createLogger('PlanTable');

interface Props {
	data: Array<{ name: string; guid: string }>;
	active: { name: string; guid: string };
}

interface State {
	top: string;
	bottom: string;
	dataRows: Array<{ name: string; active: boolean; guid: string }>;
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
		name: string
	) => {
		let { data } = this.props;
		let val = data.find((val) => {
			return val.name === name;
		});
		val = val as { name: string; guid: string };
		window.ipcRenderer.send('setWindowsPlan', val);
	};

	buildDataRows = () => {
		let { data, active } = this.props;
		let shouldUpdate = false;
		let { dataRows } = this.state;
		if (dataRows.length === 0) {
			shouldUpdate = true;
		}
		if (active) {
			dataRows.forEach((val, idx) => {
				if (val.active) {
					if (val.name !== active.name) {
						shouldUpdate = true;
					}
				}
			});
			let datarows = data.map((val, index) => {
				if (val.guid === active.guid) {
					return { name: val.name, active: true, guid: data[index].guid };
				} else {
					return { name: val.name, active: false, guid: data[index].guid };
				}
			});
			if (shouldUpdate) {
				setTimeout(() => {
					this.setState({ dataRows: datarows });
				}, 100);
			}
		}
	};

	handleCollapseChange = (e: string | string[]) => {
		LOGGER.info(`collapseChange info: ${e}`);
	};

	componentDidUpdate() {
		this.buildDataRows();
	}

	componentDidMount() {
		this.buildDataRows();
	}

	render() {
		let { dataRows } = this.state;
		return (
			<>
				<Collapse
					bordered={true}
					className="plantable-collapsible"
					style={{ justifyContent: 'flex-start' }}
					onChange={this.handleCollapseChange}
					accordion={true}
					expandIcon={({ isActive }) => (
						<CaretRightFilled rotate={isActive ? 90 : 0} />
					)}>
					{dataRows.map((data, _idx) => {
						return (
							<Panel
								header={
									<>
										{data.name}{' '}
										{data.active ? <Tag color="green">Active</Tag> : ''}
									</>
								}
								key={data.name + ' ' + data.guid}>
								<CPUBoost plan={data} />
								<Button
									style={{ marginTop: '1rem' }}
									disabled={data.active}
									onClick={(e) => this.selectWindowsPlan(e, data.name)}>
									Select Plan
								</Button>
							</Panel>
						);
					})}
				</Collapse>
			</>
		);
	}
}

/** @format */

import { Card, Form, InputNumber, PageHeader } from 'antd';
import React from 'react';

type RADJReactConfig = 'tdp' | 'ftdp' | 'stdp' | 'ftime' | 'stime' | 'temp';

interface Props {
	onInputChange: (
		event: string | number | undefined,
		value: RADJReactConfig
	) => any;
	formItems: RyzenFormItem[];
	submit: () => any;
}

interface ItemProps {
	onInputChange: (
		event: string | number | undefined,
		value: RADJReactConfig
	) => any;
	formLabel: string;
	min: number;
	max: number;
	caseKey: string;
	value: number;
}

function RyzenFormItem(itemProps: ItemProps) {
	let { onInputChange, formLabel, min, max, caseKey, value } = itemProps;
	return (
		<Form.Item
			key={caseKey + '-radjFormItem'}
			label={formLabel}
			style={{
				backgroundColor: '#F0F2F5',
				margin: '0rem',
				padding: '.3rem',
				border: '1px solid #D7D9DB',
			}}>
			<InputNumber
				key={caseKey + '-radjFormItemInput'}
				min={min}
				max={max}
				formatter={(val) => val?.toString().replace(/c|\D/gm, '') + ''}
				value={value}
				defaultValue={value}
				onChange={(e) => onInputChange(e, caseKey as RADJReactConfig)}
			/>
		</Form.Item>
	);
}

export function RyzenForm(props: Props) {
	return (
		<>
			<Form
				title="CPU Tuning"
				labelAlign="right"
				labelCol={{ span: 16, pull: 0 }}
				wrapperCol={{ flex: 'inline', span: 10 }}>
				{props.formItems.map((value, idx) => {
					let formitemprops = {
						...value,
						onInputChange: props.onInputChange,
					};
					return (
						<RyzenFormItem
							key={'formItemMain-' + idx}
							{...formitemprops}></RyzenFormItem>
					);
				})}
			</Form>
		</>
	);
}

export default RyzenForm;

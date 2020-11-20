/** @format */

import { Form, InputNumber } from 'antd';
import React from 'react';

interface Props {
	onInputChange: (e: any, changed: string) => any;
	formItems: RyzenFormItem[];
}

interface ItemProps {
	onInputChange: (e: any, changed: string) => any;
	formLabel: string;
	min: number;
	max: number;
	caseKey: string;
	value: number;
}

function RyzenFormItem(itemProps: ItemProps) {
	let { onInputChange, formLabel, min, max, caseKey, value } = itemProps;
	return (
		<Form.Item label={formLabel}>
			<InputNumber
				min={min}
				max={max}
				formatter={(val) => val?.toString().replace(/c|\D/gm, '') + ''}
				value={value}
				defaultValue={value}
				onChange={(e) => onInputChange(e, caseKey)}
			/>
		</Form.Item>
	);
}

export function RyzenForm(props: Props) {
	return (
		<Form title="CPU Tuning">
			{props.formItems.map((value, idx) => {
				let formitemprops = {
					...value,
					onInputChange: props.onInputChange,
				};
				return <RyzenFormItem {...formitemprops}></RyzenFormItem>;
			})}
		</Form>
	);
}

export default RyzenForm;

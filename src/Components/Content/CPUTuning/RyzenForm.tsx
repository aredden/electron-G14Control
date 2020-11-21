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
		<Form.Item key={caseKey + '-radjFormItem'} label={formLabel}>
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
			<PageHeader
				title="RyzenADJ CPU Tuning"
				subTitle="Modify CPU performance limits."></PageHeader>
			<Form
				title="CPU Tuning"
				labelCol={{ span: 12 }}
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
				<button onClick={props.submit}>Apply</button>
			</Form>
			<Card
				style={{
					width: '90%',
					marginLeft: '5%',
					marginRight: '5%',
					marginTop: '2rem',
				}}>
				Credit to his majesty{' '}
				<a href="https://github.com/sbski/" onClick={(e) => e.preventDefault()}>
					sbski
				</a>{' '}
				for help with this page with respect to G14 defaults, minimum & maxmimum
				values, and his contributions to AMD CPU SMU modification in general.{' '}
			</Card>
		</>
	);
}

export default RyzenForm;

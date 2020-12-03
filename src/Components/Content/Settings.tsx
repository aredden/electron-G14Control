/** @format */

import { Checkbox, message, PageHeader } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import React, { Component } from 'react';
import { store, updateShortcuts } from '../../Store/ReduxStore';

interface Props {}

interface State {
	shortcuts: ShortCuts;
}

export default class Settings extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let g14state = store.getState() as G14Config;
		this.state = {
			shortcuts: Object.assign({}, g14state.current.shortcuts),
		};
	}

	handleMinMaxEnable = async (value: CheckboxChangeEvent) => {
		message.loading('Modifying shortcuts...');
		let { shortcuts } = this.state;
		let choice = value.target.checked;
		let newShortcuts: ShortCuts = Object.assign(shortcuts, {
			minmax: {
				enabled: choice,
				accelerator: shortcuts.minmax.accelerator,
			},
		});
		let result = await window.ipcRenderer.invoke('editShortcuts', newShortcuts);
		if (result) {
			message.success(
				`Successfully ${choice ? 'enabled' : 'disabled'} shortcut!`
			);
			document.getElementById('minmaxcheckid')?.blur();
			this.setState({ shortcuts: newShortcuts }, () => {
				let reduxCementVersion = Object.assign({}, newShortcuts);
				store.dispatch(updateShortcuts(reduxCementVersion));
			});
		} else {
			message.error(`Failed to ${choice ? 'enable' : 'disable'} shortcut!`);
		}
	};

	render() {
		return (
			<div>
				<PageHeader
					title="G14Control Settings"
					subTitle="Dame u oonip & razor.. makin me stay up codin"></PageHeader>
				<Checkbox
					id="minmaxcheckid"
					onChange={this.handleMinMaxEnable}
					checked={this.state.shortcuts.minmax.enabled}>
					Minimize / maximize shortcut (Ctrl + Space) enabled.
				</Checkbox>
			</div>
		);
	}
}

/** @format */

import {
	Button,
	Card,
	Checkbox,
	Input,
	message,
	PageHeader,
	Space,
} from 'antd';
import isAccelerator from 'electron-is-accelerator';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import React, { Component } from 'react';
import { store, updateShortcuts } from '../../Store/ReduxStore';
import _ from 'lodash';

interface Props {}

interface State {
	shortcuts: ShortCuts;
	keys: string;
	recordEnabled: boolean;
}

export default class Settings extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let g14state = store.getState() as G14Config;
		let modifiableState = Object.assign({}, g14state.current.shortcuts);
		this.state = {
			shortcuts: modifiableState,
			keys: modifiableState.minmax.accelerator,
			recordEnabled: false,
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

	handleMinMaxShortcut = (event: KeyboardEvent) => {
		let { keys } = this.state;
		let newKeys = keys;
		let newKey = event.key;
		if (newKey === ' ') {
			newKey = 'Space';
		}
		if (keys.includes('+')) {
			newKeys = keys + '+' + _.capitalize(newKey);
		} else if (keys.length === 0) {
			newKeys = _.capitalize(newKey);
		} else {
			newKeys = keys + '+' + _.capitalize(newKey);
		}
		this.setState({ keys: newKeys });
	};

	recordKey = (event: KeyboardEvent) => {
		this.handleMinMaxShortcut(event);
	};

	enableRecording = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
		console.log(event);
		if (!this.state.recordEnabled) {
			document.onkeydown = this.recordKey;
		} else {
			document.onkeydown = null;
		}
		this.setState({ recordEnabled: !this.state.recordEnabled });
	};

	clearShortcut = () => {
		this.setState({ keys: '' });
	};

	componentWillUnmount() {
		if (this.state.recordEnabled) {
			document.onkeydown = null;
		}
	}

	submitNewKeys = async () => {
		message.loading('Updating shortcuts...');
		if (isAccelerator(this.state.keys)) {
			let { shortcuts } = this.state;
			let newShortcuts: ShortCuts = Object.assign(shortcuts, {
				minmax: {
					enabled: shortcuts.minmax.enabled,
					accelerator: this.state.keys,
				},
			});
			let result = await window.ipcRenderer.invoke(
				'editShortcuts',
				newShortcuts
			);
			if (result) {
				message.success(`Successfully modified shortcuts!`);
				document.getElementById('modifyshortcuts')?.blur();
				document.onkeydown = null;
				this.setState({ shortcuts: newShortcuts, recordEnabled: false }, () => {
					let reduxCementVersion = Object.assign({}, newShortcuts);
					store.dispatch(updateShortcuts(reduxCementVersion));
				});
			} else {
				message.error('There was an issue modifying shortcut.');
			}
		} else {
			message.warning('Invalid shortcut!');
		}
	};

	render() {
		let { recordEnabled, shortcuts, keys } = this.state;
		return (
			<div>
				<PageHeader
					title="G14Control Settings"
					subTitle="Edit G14ControlV2 related settings & shortcuts."></PageHeader>
				<Card
					title="Shortcut: Bring to front or minimize"
					headStyle={{ backgroundColor: '#F0F2F5' }}
					bordered>
					<Space direction="vertical">
						<div>
							<Checkbox
								id="minmaxcheckid"
								onChange={this.handleMinMaxEnable}
								checked={shortcuts.minmax.enabled}>
								Enabled
							</Checkbox>
							<Checkbox checked={recordEnabled} onClick={this.enableRecording}>
								Enable shortcut recording
							</Checkbox>
							<Button disabled={!recordEnabled} onClick={this.clearShortcut}>
								Clear Macro
							</Button>
						</div>
						<Input disabled value={keys}></Input>
						<Button
							id="modifyshortcuts"
							disabled={shortcuts.minmax.accelerator === this.state.keys}
							onClick={this.submitNewKeys}>
							Update
						</Button>
					</Space>
				</Card>
			</div>
		);
	}
}

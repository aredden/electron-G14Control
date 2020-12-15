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
import { store, updateROGKey, updateShortcuts } from '../../Store/ReduxStore';
import { capitalize } from 'lodash';
import ReactMarkdown from 'react-markdown';

interface Props {}

interface State {
	shortcuts: ShortCuts;
	keys: string;
	recordEnabled: boolean;
	rogRemapped: boolean;
	func: string;
	armouryEnabled: boolean;
}

export default class Settings extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let g14state = store.getState() as G14Config;
		let rogState = Object.assign({}, g14state.current.rogKey);
		let shortCutsState = Object.assign({}, g14state.current.shortcuts);
		this.state = {
			shortcuts: shortCutsState,
			keys: shortCutsState.minmax.accelerator,
			recordEnabled: false,
			armouryEnabled: Boolean(rogState.armouryCrate),
			func: 'minmax',
			rogRemapped: Boolean(rogState.enabled),
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
			newKeys = keys + '+' + capitalize(newKey);
		} else if (keys.length === 0) {
			newKeys = capitalize(newKey);
		} else {
			newKeys = keys + '+' + capitalize(newKey);
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

	handleReviveROG = async () => {
		message.loading('Renaming Armoury Crate executables...');
		let result = await window.ipcRenderer.invoke('enableROG');
		if (result) {
			message.success(
				'Successfully renamed executables, restart computer to complete the process.'
			);
			let { rogRemapped, armouryEnabled, func } = this.state;
			this.setState({ armouryEnabled: !armouryEnabled }, () => {
				store.dispatch(
					updateROGKey({
						enabled: rogRemapped,
						armouryCrate: !armouryEnabled,
						func: func,
					})
				);
			});
		} else {
			message.error(
				'There was an issue renaming executables...Send logs to the developer.'
			);
		}
	};

	handleKillROG = async () => {
		message.loading('Killing and renaming Armoury Crate processes...');
		let result = await window.ipcRenderer.invoke('disableROG');
		if (result) {
			message.success('Successfully disabled ROG functions.');
			let { rogRemapped, armouryEnabled, func } = this.state;
			this.setState({ armouryEnabled: !armouryEnabled }, () => {
				store.dispatch(
					updateROGKey({
						enabled: rogRemapped,
						armouryCrate: !armouryEnabled,
						func: func,
					})
				);
			});
		} else {
			message.error('There was an issue disabling ROG functions.');
		}
	};

	handleRemap = async () => {
		message.loading('Remapping ROG Key');
		let result = await window.ipcRenderer.invoke('remapROG', 'minmax');
		if (result) {
			message.success(
				'Successfully remapped ROG Key to minimize / maximize G14ControlV2'
			);
			let { rogRemapped, armouryEnabled, func } = this.state;
			this.setState({ rogRemapped: !rogRemapped }, () => {
				store.dispatch(
					updateROGKey({
						enabled: !rogRemapped,
						armouryCrate: armouryEnabled,
						func,
					})
				);
			});
		} else {
			message.error('Error remapping rog key.');
		}
	};

	handleUnmap = async () => {
		message.loading('Removing key listener...');
		let result = await window.ipcRenderer.invoke('unbindROG');
		if (result) {
			message.success('Successfully removed custom ROG Key listener.');
			let { rogRemapped, armouryEnabled, func } = this.state;
			this.setState({ rogRemapped: !rogRemapped }, () => {
				store.dispatch(
					updateROGKey({
						enabled: !rogRemapped,
						armouryCrate: armouryEnabled,
						func,
					})
				);
			});
		} else {
			message.error('Error removing ROG key listener.');
		}
	};

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

		let mkd = `
### To stop Armoury Crate ROG Key:

If you have Armoury Crate installed, you must use the *"Disable ROG"* button, 
which will result in most **Armoury Crate**
functionality not working, since Armoury Crate processes need to be
killed and their executables need to be renamed so they are not
reopened automatically and result in Armoury Crate being opened upon pressing the key.

### To get the normal ROG Key and Armoury Crate running again:

Just pressing the *"Enable ROG"* button will not bring
back Armoury Crate. You need to press the *"Enable ROG"* button, and
then restart your computer, so that the processes get spun up the
way they are supposed to. 

`;

		let aboutmkd = `
G14ControlV2 is the successor of some buggy software I made a while ago, called G14ControlR3.
After struggling with that software and coming to the conclusion that it wasn't ever going
to perform well, I decided to embark on making a new version, and this is the result!`;
		return (
			<div>
				<PageHeader
					title="G14Control Settings"
					subTitle="Edit G14ControlV2 related settings & shortcuts."
				/>
				<Space direction="vertical">
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
								<Checkbox
									checked={recordEnabled}
									onClick={this.enableRecording}>
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
					<Card title="ROG Key Remapping">
						<Space direction="vertical">
							<ReactMarkdown skipHtml>{mkd}</ReactMarkdown>
							<Space direction="horizontal" style={{ marginBottom: '1rem' }}>
								<Button
									disabled={this.state.armouryEnabled}
									onClick={this.handleKillROG}>
									Disable ROG
								</Button>
								<Button
									disabled={!this.state.armouryEnabled}
									onClick={this.handleReviveROG}>
									Enable ROG
								</Button>
							</Space>
							<ReactMarkdown>
								To remap the ROG Key to open G14ControlV2 (as long as the
								program is open) press the *"Remap ROG"* button.
							</ReactMarkdown>
							<Space direction="horizontal">
								<Button
									disabled={this.state.rogRemapped}
									onClick={this.handleRemap}>
									Remap ROG
								</Button>
								<Button
									disabled={!this.state.rogRemapped}
									onClick={this.handleUnmap}>
									Undo ROG Remap
								</Button>
							</Space>
						</Space>
					</Card>
					<Card title={'About G14ControlV2'}>
						<ReactMarkdown>{aboutmkd}</ReactMarkdown>
						<Space>
							<button
								onClick={(e) => {
									e.preventDefault();
									window.shell.openExternal(
										'https://github.com/aredden/electron-g14control'
									);
								}}>
								Check out the repository
							</button>
							<button
								onClick={(e) => {
									e.preventDefault();
									window.shell.openExternal(
										'https://www.paypal.com/pools/c/8uiaar8Sl9'
									);
								}}>
								Buy me a coffee!
							</button>
						</Space>
					</Card>
				</Space>
			</div>
		);
	}
}

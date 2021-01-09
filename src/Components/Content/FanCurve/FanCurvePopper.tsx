/** @format */

import { List } from 'antd';
import React, { Component } from 'react';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactMarkdown from 'react-markdown';
import Modal from 'antd/lib/modal/Modal';
interface Props {}
interface State {
	visible: boolean;
}

interface ModalContainerProps {
	clickIt: () => void;
}

class ModalContainer extends Component<ModalContainerProps> {
	render() {
		let acplan = `**Armoury Crate Plans**
\n
* You can change an Armoury Crate plan without ever touching the "Apply" button.
All you need to do is choose a different radio button, exactly the same as with Armoury Crate itself.
* If you want to create a custom fan curve, it needs to also have an Armoury Crate plan associated with it.
It will use whatever Armoury Crate plan is currently selected in the Armoury Crate plan box.
* If a fan curve is currently applied, and you change the Armoury Crate plan, it will overwrite the fan curve
and use the standard fan curve for the selected Armoury Crate plan.
* Armoury Crate plans will actually do more than set a fan curve, for instance, the "Silent" plan will actually
throttle the CPU wattages set by ryzenadj / CPU Tuning, by about 20%. The "Windows" plan is actually exactly
the same as the "Performance" plan, but in Armoury Crate it also sets the windows plan to "Balanced". In this app
it doesn't actually do anything different than the "Performance" plan. I'm not as sure about the "Turbo" plan, but
I assume it does some other tweaks under the hood, or it just sets a more aggressive default fan curve. \n
**Custom Fan Curves**\n
* If the custom fan curves dropdown title is blank, that means no fan curve is selected.
* To select a curve, click the dropdown and select a custom fan curve.
* Selecting a fan curve will not apply it, for that you need to click the "Apply" button.
* Any changes made to the fan curve before applying the plan will apply the modifications to the selected plan
when you click "Apply", including modifications to the selected Armoury Crate plan.`;

		return (
			<div onClick={this.props.clickIt}>
				<List style={{ display: 'block', maxWidth: '100%' }}>
					<List.Item
						style={{ display: 'block', fontSize: '1.2vw' }}
						title="yes">
						<ReactMarkdown>{acplan}</ReactMarkdown>
					</List.Item>
				</List>
			</div>
		);
	}
}

export class FanCurveModal extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { visible: false };
	}

	clickModal = () => {
		this.setState({ visible: !this.state.visible });
	};

	render() {
		return (
			<>
				<Modal
					title="Fan Curve Editor Info"
					onOk={() => this.setState({ visible: !this.state.visible })}
					onCancel={() => this.setState({ visible: !this.state.visible })}
					width={'90vw'}
					footer={null}
					visible={this.state.visible}
					cancelButtonProps={{ style: { display: 'none' } }}>
					<ModalContainer clickIt={this.clickModal} />
				</Modal>

				<button
					className="fc-modal-btn"
					onClick={() => this.setState({ visible: !this.state.visible })}>
					{' '}
					<FontAwesomeIcon width="14px" icon={faQuestion}></FontAwesomeIcon>
				</button>
			</>
		);
	}
}

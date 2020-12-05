/** @format */

import { renameProcess } from './HIDDevice';
import {
	ARMCRATE_INTERFACE,
	ARMCRATE_KEY_CTRL,
	ARMCRATE_SESS_HELPER,
	ARMCRATE_SVC,
	ARMCRATE_SVC_PATH,
	ARMORY_SW_AGENT,
	ARMORY_SW_AGENT_PATH,
	ARMSOCK_SERV,
	ARMSOCK_SERV_PATH,
	ASUSACCI_PATH,
} from './constants';

export const undoAllRenames = async () => {
	return new Promise((resolve) => {
		// THE HILL OF REDEMPTION.
		renameProcess(
			ARMSOCK_SERV + '_disabled',
			ARMSOCK_SERV,
			ARMSOCK_SERV_PATH
		).then((result) => {
			renameProcess(
				ARMCRATE_INTERFACE + '_disabled',
				ARMCRATE_INTERFACE,
				ASUSACCI_PATH
			).then((result) => {
				renameProcess(
					ARMCRATE_KEY_CTRL + '_disabled',
					ARMCRATE_KEY_CTRL,
					ASUSACCI_PATH
				).then((result) => {
					renameProcess(
						ARMORY_SW_AGENT + '_disabled',
						ARMORY_SW_AGENT,
						ARMORY_SW_AGENT_PATH
					).then((result) => {
						renameProcess(
							ARMCRATE_SVC + '_disabled',
							ARMCRATE_SVC,
							ARMCRATE_SVC_PATH
						).then((result) => {
							renameProcess(
								ARMCRATE_SESS_HELPER + '_disabled',
								ARMCRATE_SESS_HELPER,
								ARMCRATE_SVC_PATH
							).then((result) => {
								resolve(true);
							});
						});
					});
				});
			});
		});
	});
};

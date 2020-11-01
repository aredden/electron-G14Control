/** @format */

import WmiClient from 'wmi-client';
import getLogger from '../../Logger';

const LOGGER = getLogger('WMI');

export const getCPULoad = async () => {
	return new Promise((resolve, reject) => {
		let wmic = new WmiClient();
		wmic.query('Select LoadPercentage from Win32_Processor', function (
			err: any,
			result: any
		) {
			if (err) {
				LOGGER.info(
					`Error getting total cpu load from WmiClient:\n${JSON.stringify(
						err,
						null,
						2
					)}`
				);
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
};

export const getCoresLoad = () => {
	return new Promise((resolve, reject) => {
		let wmic = new WmiClient();
		wmic.query(
			'Select Name,PercentProcessorTime from Win32_PerfFormattedData_PerfOS_Processor',
			function (err: any, result: any) {
				if (err) {
					LOGGER.info(
						`Error getting individual cores load from WmiClient:\n${JSON.stringify(
							err,
							null,
							2
						)}`
					);
					reject(err);
				} else {
					resolve(result);
				}
			}
		);
	});
};

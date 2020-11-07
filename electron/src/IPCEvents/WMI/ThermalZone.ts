/** @format */
import WmiClient from 'wmi-client';
import getLogger from '../../Logger';
import cp from 'child_process';
const LOGGER = getLogger('WMI');

export const getHighPrecisionTemperature = async () => {
	return new Promise((resolve, reject) => {
		let wmic = new WmiClient();
		wmic.query(
			'Select HighPrecisionTemperature from Win32_PerfFormattedData_Counters_ThermalZoneInformation',
			function (err, result) {
				if (err) {
					LOGGER.info(
						`Error getting temperature from WmiClient:\n${JSON.stringify(
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

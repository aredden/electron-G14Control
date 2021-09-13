/** @format */
import WmiClient from 'wmi-client';
import getLogger from '../../Logger';
const LOGGER = getLogger('WMI');

export const getHighPrecisionTemperature = async () => {
	return new Promise((resolve, reject) => {
		let wmic = new WmiClient();
		wmic.query(
			'Select HighPrecisionTemperature from Win32_PerfFormattedData_Counters_ThermalZoneInformation',
			function (err: any, result: any) {
				if (err) {
					LOGGER.info(`Error getting temperature from WmiClient:\n${JSON.stringify(err, null, 2)}`);
					reject(err);
				} else {
					resolve(result);
				}
			}
		);
	});
};

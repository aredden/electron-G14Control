/** @format */
import Shell from 'node-powershell';
import getLogger from '../../Logger';
import dotenv from 'dotenv';
import is_dev from 'electron-is-dev';
import path from 'path';
import { app } from 'electron';
dotenv.config();

//@ts-ignore
// eslint-ignore-next-line
const screenrefloc = is_dev
	? (process.env.SCREEN_REF_LOC as string)
	: path.join(
			app.getPath('exe'),
			'../',
			'resources',
			'extraResources',
			'ChangeScreenResolution.exe'
	  );

const LOGGER = getLogger('DisplayConfig');

const ps = new Shell({
	executionPolicy: 'Bypass',
	noProfile: true,
});

const buildCommandString = (
	display: number,
	refresh?: number,
	width?: number,
	height?: number
) => {
	let command = ` /d=${display}`;
	if (refresh) {
		command = command + ` /f=${refresh}`;
	}
	if (width && height) {
		command = command = ` /w=${width} /h=${height}`;
	}
	return command;
};

export const setDisplayConfig = async (
	display: number = 0,
	refresh?: number,
	width?: number,
	height?: number
) => {
	if (
		(!refresh && !width && !height) ||
		(!refresh && width && !height) ||
		(!refresh && height && !width)
	) {
		return false;
	}
	let cmdString = buildCommandString(display, refresh, width, height);
	return new Promise((resolve) => {
		ps.addCommand(`${screenrefloc} ${cmdString}`);
		ps.invoke()
			.then((result) => {
				LOGGER.info(
					`Successfully changed screen resolution with ChangeScreenResolution.exe command:\n${JSON.stringify(
						cmdString
					)}`
				);
				resolve(result);
			})
			.catch((err) => {
				LOGGER.info(
					`Error with ChangeScreenResolution.exe command:\n${JSON.stringify({
						display,
						refresh,
						width,
					})}\n${err}`
				);
				resolve(false);
			});
	});
};

export const parseDisplayOptions = (stringOpts: string) => {
	let opts = stringOpts.split(
		/ {0,2}Display modes for \\\\\.\\DISPLAY[0-9]{1,2}:/gm
	);
	if (!opts || opts.length < 2) {
		return [];
	}
	let defaultRefresh: number = 120;
	if (stringOpts.indexOf('@120Hz') === -1) {
		defaultRefresh = 60;
	}
	opts.shift();
	let d0 = opts[0].replace(/\r| {2,10}/gm, '');
	let d0arr = d0.split(`\n`).filter((el) => el !== '');
	let results: Array<DisplayOptionData> = d0arr.map((result) => {
		let resString =
			//@ts-ignore
			(result && result.match(/[0-9]{3,4}x[0-9]{3,4}/gm)[0]) || '1920x1080';
		let resArr = resString.split('x');
		let resolution = {
			width: 1920,
			height: 1080,
		};
		if (resArr && resArr.length === 2) {
			let width = resArr[0];
			let height = resArr[1];
			resolution = {
				width: parseInt(width),
				height: parseInt(height),
			};
		} else {
			LOGGER.info(`Trouble parsing width & height for line ${result}`);
		}

		let bitString = result.match(/[0-9]{1,2}bit/);
		let bits = 32;
		if (bitString && bitString.length === 1) {
			bits = parseInt(bitString[0].replace('bit', ''));
		} else {
			LOGGER.info(`Trouble parsing bit color for line ${result}`);
		}

		let refresh = defaultRefresh;
		let refreshString = result.match(/@[0-9]{2,3}Hz/gm);
		if (refreshString && refreshString.length === 1) {
			refresh = parseInt(refreshString[0].replace(/@|[a-zA-Z]/gm, ''));
		} else {
			LOGGER.info(`Trouble parsing refresh rate for ${result}`);
		}

		let format = 'default';
		let formatStr = result.match(/(centered|stretched|default)$/gm);
		if (formatStr && formatStr.length === 1) {
			format = formatStr[0];
		} else {
			LOGGER.info(`Trouble parsing format for ${result}`);
		}
		let option: DisplayOptionData = {
			resolution,
			bits,
			refresh,
			format,
		};
		return option;
	});
	return results;
};

export const getDisplays = async () => {
	return new Promise((resolve) => {
		ps.addCommand(`${screenrefloc} /m`);
		ps.invoke()
			.then((result) => {
				resolve(parseDisplayOptions(result));
			})
			.catch((err) => {
				LOGGER.info('Error parsing display options:\n' + err);
				resolve(false);
			});
	});
};

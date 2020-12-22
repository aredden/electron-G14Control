/** @format */

import { BrowserWindow, app, nativeImage } from 'electron';
import is_dev from 'electron-is-dev';
import path from 'path';

const EXIT_ICON = is_dev
	? path.join(__dirname, '../', 'src', 'assets', 'exit-white.png')
	: path.join(
			app.getPath('exe'),
			'../',
			'resources',
			'extraResources',
			'exit-white.png'
	  );

const MIN_TRAY_ICON = is_dev
	? path.join(__dirname, '../', 'src', 'assets', 'trayminimize-white.png')
	: path.join(
			app.getPath('exe'),
			'../',
			'resources',
			'extraResources',
			'trayminimize-white.png'
	  );

const G14_ICON = is_dev
	? path.join(__dirname, '../', 'src', 'assets', 'icon_light.png')
	: path.join(
			app.getPath('exe'),
			'../',
			'resources',
			'extraResources',
			'icon-light.png'
	  );

export const buildTaskbarMenu = async (win: BrowserWindow) => {
	win.setThumbarButtons([
		{
			icon: nativeImage.createFromPath(G14_ICON),
			click: () => {
				win.show();
			},
		},
		{
			icon: nativeImage.createFromPath(MIN_TRAY_ICON),
			click: () => {
				win.hide();
			},
		},
		{
			icon: nativeImage.createFromPath(EXIT_ICON),
			click: () => {
				app.quit();
			},
		},
	]);
	return win;
};

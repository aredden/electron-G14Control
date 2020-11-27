/** @format */

import { app, BrowserWindow, Menu, Tray, Notification } from 'electron';
import { showIconEnabled } from './electron';
import { resetGPU } from './IPCEvents/gpu/DiscreteGPU';
import { killEmitters, loopsAreRunning } from './IPCEvents/IPCEmitters';

export const buildTrayIcon = (
	tray: Tray,
	trayContext: Menu,
	browserWindow: BrowserWindow
) => {
	tray = new Tray('C:\\temp\\icon_light.png');
	tray.on('click', (ev, bounds) => {
		if (browserWindow.isMinimized()) {
			browserWindow.restore();
		} else if (!browserWindow.isVisible()) {
			browserWindow.show();
		} else {
			browserWindow.minimize();
		}
	});
	trayContext = Menu.buildFromTemplate([
		{
			label: 'Show App',
			type: 'normal',
			id: 'showapp',
			enabled: showIconEnabled,
			click: (item) => {
				browserWindow.show();
			},
		},
		{
			label: 'Hide App',
			type: 'normal',
			id: 'hideapp',
			enabled: !showIconEnabled,
			click: (item) => {
				browserWindow.hide();
			},
		},
		{
			type: 'separator',
		},
		{
			label: 'Reset GPU',
			type: 'normal',
			click: () => {
				resetGPU().then((value) => {
					new Notification({
						title: 'G14Control',
						body: 'GPU Successfully Reset.',
					}).show();
				});
			},
		},
		{
			type: 'separator',
		},
		{
			label: 'Reset Renderer',
			type: 'normal',
			click: async (item) => {
				if (loopsAreRunning()) {
					await killEmitters();
				}
				browserWindow.reload();
			},
		},
		{
			label: 'Quit',
			type: 'normal',
			click: () => {
				app.quit();
			},
		},
	]);
	tray.setToolTip('G14ControlV2');
	tray.setTitle('G14ControlV2');
	tray.setContextMenu(trayContext);
	return { tray, trayContext, browserWindow };
};

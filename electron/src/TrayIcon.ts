/** @format */

import { app, BrowserWindow, Menu, Tray, Notification } from 'electron';
import { showIconEnabled } from './electron';
import { resetGPU } from './IPCEvents/gpu/DiscreteGPU';
import {
	killEmitters,
	loopsAreRunning,
	runLoop,
} from './IPCEvents/IPCEmitters';

export const buildTrayIcon = (
	tray: Tray,
	trayContext: Menu,
	browserWindow: BrowserWindow
) => {
	tray = new Tray('C:\\temp\\icon_light.png');
	tray.on('click', (ev, bounds) => {
		browserWindow.show();
		if (!loopsAreRunning()) {
			runLoop(browserWindow);
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
				browserWindow.webContents.reload();
				item.enabled = !item.enabled;
				item.menu.items[1].enabled = !item.enabled;
			},
		},
		{
			label: 'Hide App',
			type: 'normal',
			id: 'hideapp',
			enabled: !showIconEnabled,
			click: (item) => {
				killEmitters();
				browserWindow.hide();
				item.enabled = !item.enabled;
				item.menu.items[0].enabled = !item.enabled;
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
			click: (item) => {
				killEmitters();
				browserWindow.reload();
			},
		},
		{
			label: 'Quit',
			type: 'normal',
			click: () => {
				tray.closeContextMenu();
				tray.destroy();
				app.quit();
			},
		},
	]);
	tray.setToolTip('G14Control');
	tray.setContextMenu(trayContext);
	return { tray, trayContext, browserWindow };
};

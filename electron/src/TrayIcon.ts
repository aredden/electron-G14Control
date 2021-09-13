/** @format */

import { app, BrowserWindow, Menu, Tray, Notification, nativeTheme } from 'electron';
import { showIconEnabled } from './electron';
import { resetGPU } from './IPCEvents/gpu/DiscreteGPU';
import { killEmitters, loopsAreRunning } from './IPCEvents/IPCEmitters';
import is_dev from 'electron-is-dev';
import path from 'path';
import { getActivePlan, getWindowsPlans, setWindowsPlan } from './IPCEvents/powercfg/Powercfg';
const ICONPATH = is_dev
	? path.join(
			__dirname,
			'../',
			'src',
			'assets',
			nativeTheme.themeSource === 'light' ? 'icon_dark.png' : 'icon_light.png'
	  )
	: path.join(app.getPath('exe'), '../', 'resources', 'extraResources', 'icon_light.png');

export const buildTrayIcon = async (
	tray: Tray,
	trayContext: Menu,
	browserWindow: BrowserWindow
) => {
	tray = new Tray(ICONPATH);
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
			label: 'Windows Plans',
			type: 'submenu',
			id: 'windowsSubmenu',
			submenu: await buildWindowsSwitcher(trayContext),
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
		is_dev
			? {
					label: 'Open Dev Tools',
					role: 'help',
					accelerator: 'Control+Shift+I',
					click: () => {
						browserWindow.webContents.openDevTools();
					},
			  }
			: {
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
	trayContext.getMenuItemById('windowsSubmenu').submenu.items.forEach((item) => {
		item.click = async (e: any, f: any) => {
			console.log(JSON.stringify({ e, f }));
			trayContext.getMenuItemById(
				((await getActivePlan()) as { name: string; guid: string }).guid
			).checked = false;
			let result = await setWindowsPlan(item.id);
			if (result) {
				item.checked = true;
			}
		};
	});
	return { tray, trayContext, browserWindow };
};

const buildWindowsSwitcher = async (context: Menu) => {
	let items: Menu = new Menu();
	let ctx = [];
	let plan = (await getActivePlan()) as { name: string; guid: string };
	let plans = await getWindowsPlans();
	if (plans) {
		for (var x = 0; x < plans.length; x++) {
			ctx.push({
				label: plans[x].name,
				id: plans[x].guid,
				type: 'radio',
				checked: plans[x].guid === plan.guid,
			});
		}
		items = Menu.buildFromTemplate(ctx);
		return items;
	} else return undefined;
};

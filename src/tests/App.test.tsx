/** @format */

import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import App from '../App';

beforeEach(() => {
	Object.defineProperty(window, 'ipcRenderer', {
		writable: true,
		enumerable: false,
		value: {
			on: jest.fn(),
			off: jest.fn(),
			send: jest.fn(),
		},
	});
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: jest.fn().mockImplementation((query) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: jest.fn(), // Deprecated
			removeListener: jest.fn(), // Deprecated
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
			dispatchEvent: jest.fn(),
		})),
	});
});
afterEach(cleanup);

test('renders G14Control logo header', () => {
	let app = render(<App />);

	const headerElement = app.getByText('G14Control', {
		selector: '.ant-layout-header',
	});
	expect(headerElement).toBeInTheDocument();
});

test('renders all menu items', () => {
	let app = render(<App />);
	const menuitems = app.getAllByRole('menuitem');
	expect(menuitems.length).toBe(5);
	for (let x of menuitems) {
		expect(x.innerHTML).toMatch(
			/Auto Power Switch|Configuration|Processor Boost|Discrete GPU|Windows Power Plan/
		);
	}
});

test('renders windows plan page', async () => {
	let app = render(<App />);
	const menuitems = app.getAllByRole('menuitem');
	let windowsPlanMenuItem = menuitems.filter((value) =>
		value.innerHTML.match('Windows Power Plan')
	);
	expect(windowsPlanMenuItem).toBeDefined();
	fireEvent.click(windowsPlanMenuItem[0].firstChild as HTMLElement);
	const content = await app.findByRole('table');
	expect(content).toBeDefined();
});

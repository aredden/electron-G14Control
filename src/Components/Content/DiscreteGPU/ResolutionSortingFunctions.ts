/** @format */

export const calcResolutionSort = (
	a: DisplayOptionListType,
	b: DisplayOptionListType
) => {
	let numaarr = a.resolution.toString().match(/\d*x/) as RegExpMatchArray;
	let numbarr = b.resolution.toString().match(/\d*x/) as RegExpMatchArray;
	if (numaarr && numbarr) {
		return (
			-parseInt(numbarr[0].replace('x', '')) +
			parseInt(numaarr[0].replace('x', ''))
		);
	} else {
		return -1000;
	}
};

export const calcRefreshSort = (
	a: DisplayOptionListType,
	b: DisplayOptionListType
) => {
	console.log(a, b);
	return (b.refresh as number) - (a.refresh as number);
};

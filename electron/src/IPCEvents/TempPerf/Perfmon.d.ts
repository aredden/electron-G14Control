/** @format */

declare module 'perfmon' {
	export default function perfmon(
		counters: string[],
		callback: (err: any, data: any) => void
	): PerfmonStream;
	export interface PerfmonStream {
		pause: () => any;
		resume: () => any;
	}
}

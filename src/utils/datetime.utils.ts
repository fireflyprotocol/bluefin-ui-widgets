import moment, { utc } from "moment";

import { zeroPadding } from "./utils";

export const Formats = {
	dateTime: "DD-MM-YYYY HH:mm:ss",
	monthDay: "MMM DD",
	year: "YYYY",
	month: "MMM",
	day: "DD",
};

export const getUtcCounter = () => {
	return `${zeroPadding(59 - moment.utc().minute(), 2)}:${zeroPadding(
		59 - moment().utc().second(),
		2
	)}`;
};

export const subtractOffsetToDate = (date: number, DaysOffset: number) => {
	return moment(date).subtract(DaysOffset, "days").valueOf();
};

export function addDaysToDate(date: number, days: number) {
	return moment(date).add(days, "days").valueOf();
}

export function getDateInSeconds(dateInMs: number) {
	return moment(dateInMs).unix(); //returns date in seconds
}

export function getDateTimeFromSeconds(timestamp: number, isUTC: boolean = false) {
	return isUTC
		? moment(timestamp * 1000)
				.utc()
				.format("DD-MM-YYYY HH:mm:ss")
		: moment(timestamp * 1000).format("DD-MM-YYYY HH:mm:ss");
}

export function getDateTimeFromDateString(
	timestamp: string | number,
	isUTC: boolean = false
) {
	return isUTC
		? moment(timestamp).utc().format("DD MMM YYYY HH:mm:ss")
		: moment(timestamp).format("DD MMM YYYY HH:mm:ss");
}
export function getMonthNameBySeconds(seconds: number) {
	return moment(seconds * 1000).format("MMMM");
}

export function getFormattedDateFromSeconds(
	timestamp: string,
	format: string = Formats.dateTime,
	isUTC: boolean = false
) {
	return isUTC
		? moment(timestamp).utc().format(format)
		: moment(timestamp).format(format);
}

export function getDateInSecondsFromDateString(date: string) {
	if (!date) {
		return null;
	}
	const dateInMs = Date.parse(date); // Convert date string to milliseconds
	return getDateInSeconds(dateInMs);
}

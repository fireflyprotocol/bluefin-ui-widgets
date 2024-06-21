import millify from "millify";
import {
	BASE_DECIMALS,
	bigNumber,
	BigNumber as BN,
	bnMul,
	bnStrToBaseNumber,
	toBigNumber,
	BigNumber,
} from "@firefly-exchange/library";
import _ from "lodash";

import { DEFAULT_PRECISION } from "constants/Common";

/* String Utils */
export function shortenString(
	str: string,
	retainStart: number = 6,
	retainEnd: number = 3,
	ellipsis: string = "...."
): string {
	if (str.length > retainStart + retainEnd + ellipsis.length) {
		return (
			str.substr(0, retainStart) +
			"...." +
			str.substr(str.length - retainEnd, str.length)
		);
	} else {
		return str;
	}
}

// Capitalizes first letter of each word in a string.
export function toTitleCase(
	str: string,
	delimeter = " ",
	removeDelimeter = false
): string {
	const titleCaseStr = str
		.toLowerCase()
		.split(delimeter)
		.map((s) => s.charAt(0).toUpperCase() + s.substring(1))
		.join(" ");
	return removeDelimeter ? replaceDelimiter(titleCaseStr, delimeter) : titleCaseStr;
}

export function replaceDelimiter(str: string, delimeter = "_"): string {
	return str.replaceAll(delimeter, " ");
}

/* Date/Time Utils */

export function timestampToDateStr(ts: number | string): string {
	return new Date(ts).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

export function timestampToTimeStr(ts: number | string): string {
	return new Date(ts).toTimeString().substr(0, 8);
}

export function unixTimestampToDateStr(tsUnix: number) {
	return new Date(tsUnix * 1000).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

export function unixTimestampToDateStrFormatted(unixTimestamp: number): string {
	// out put format : M/D/Year
	const date = new Date(unixTimestamp * 1000); // Unix timestamps are in seconds, so multiply by 1000 to get milliseconds
	const options: Intl.DateTimeFormatOptions = {
		month: "numeric",
		day: "numeric",
		year: "2-digit", // Two-digit representation of the year
	};
	return date.toLocaleDateString("en-US", options);
}

export function unixTimestampToTimeString(tsUnix: number) {
	let d = new Date(tsUnix * 1000);
	return d.toTimeString().split(" ")[0];
}

/* Number Utils */

export function getSign(num: number): "+" | "-" | "" {
	return num > 0 ? "+" : num < 0 ? "-" : "";
}

export function numberToCommas(num: number, precision?: number) {
	return num.toLocaleString("en-us", {
		minimumFractionDigits:
			precision != undefined && !isNaN(precision) ? precision : 2,
		maximumFractionDigits:
			precision != undefined && !isNaN(precision) ? precision : 2,
	});
}

export function numberToSignedStr(
	num: number,
	precision: number,
	sign?: "+" | "-" | ""
): string {
	const signed = sign === undefined ? getSign(num) : sign;
	const absNum = Math.abs(num);
	return `${signed}${numberToCommas(absNum, precision)}`;
}

export function numberToSignedPercentStr(num: number, sign?: "+" | "-" | ""): string {
	return `${numberToSignedStr(num, 2, sign)}%`;
}

export function numberToPercent(num: number, precision: number): string {
	return `${numberToCommas(num * 100, precision)}%`;
}

export function stringToCommas(value: string, precision: number): string {
	return numberToCommas(parseFloat(value), precision);
}

export function numberToMillify(num: number): string {
	if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
		return "100T+";
	}
	return num > 1_000_000 ? millify(num) : `${num.toLocaleString("en-us")}`;
}

export function numberToDollars(num: number, precision?: number, millify = true): string {
	if (!num) num = 0;
	return millify && num > 1_000_000
		? `$${numberToMillify(num)}`
		: num.toLocaleString("en-us", {
				style: "currency",
				currency: "usd",
				minimumFractionDigits: precision ?? 2,
				maximumFractionDigits: precision ?? 2,
		  });
}

export function getRandom(max: number = 1000): number {
	return Math.floor(Math.random() * max);
}

/* 287.40 * 100 = 287.399996 instead of 28740 in native JS multiplication,
 * for a more precise handling of these edge cases use the roundBnWithPrecision method */
export function roundWithPrecision(
	val: number,
	precision: number,
	direction: "up" | "down" | "none" = "none"
): number {
	const multiplier = Math.pow(10, precision || 0);
	const valWithMultiplier = val * multiplier;
	const roundedVal =
		direction === "up"
			? Math.ceil(valWithMultiplier) / multiplier
			: direction === "down"
			? Math.floor(valWithMultiplier) / multiplier
			: Math.round(valWithMultiplier) / multiplier;
	return roundedVal;
}

export function roundBnWithPrecision(
	bnValue: string,
	precision: number,
	direction: "up" | "down" | "none" = "none"
): number {
	const multiplier = Math.pow(10, precision || 0);
	const valWithMultiplier = bnStrToNumber(bnMul(bnValue, toBigNumber(multiplier)));
	const roundedVal =
		direction === "up"
			? Math.ceil(valWithMultiplier) / multiplier
			: direction === "down"
			? Math.floor(valWithMultiplier) / multiplier
			: Math.round(valWithMultiplier) / multiplier;
	return roundedVal;
}

//add leading zeros to incoming number(param:num) if the number length is less the places(param:places) and return string with leading zeros
export const zeroPadding = (num: number, places: number) => {
	return String(num).padStart(places, "0");
};

// Filters chars to produce a positive rational number
export function positiveNumberOnlyFilter(chars: string, precision?: number): string {
	let positiveNumber = chars
		.replace(/[^0-9^\.]+/g, "") // Remove any char not between 0-9 & not a "."
		.replace(".", "$#$") // Replace the first period with a temp delimter "$#$"
		.replace(/\./g, "") // Remove all remaining periods
		.replace("$#$", "."); // Replace the delimeter back with the original period

	if (precision || precision === 0) {
		// Only match with the first p values after period
		const regex = new RegExp(`^\\d*(?:.\\d{0,${precision}})?`);
		positiveNumber = positiveNumber.match(regex)?.[0] || "";
	}

	return positiveNumber;
}

export function sanitizeNumberString(input: string) {
	if (!input) return input;
	return input.replace(/[^\d.-]/g, "");
}

/**
 * Formats the BN string to DEFAULT_PRECISION
 * @param bnStr bignumber string
 * @returns {string} number formatted to DEFAULT_PRECISION in string
 */
export function formatBnStr(bnStr: string): string {
	const bn = bigNumber(bnStr)
		.shiftedBy(-BASE_DECIMALS)
		.decimalPlaces(DEFAULT_PRECISION, 1); //bigNumber chopped to DEFAULT_PRECISION, using .shiftedBy becuase bnStrToBaseNumber looses precision
	return bn.toFixed(DEFAULT_PRECISION);
}

/* Big Number Utils */

/* --- From Big Number String */
export function bnStrToNumber(
	val: string,
	precision?: number,
	direction?: "up" | "down" | "none"
): number {
	return precision !== undefined
		? roundBnWithPrecision(val, precision, direction) //by default "none direction"
		: bnStrToBaseNumber(val);
}

export function bnStrToAbsNumber(val: string, precision?: number): number {
	const absVal = new BN(val).abs().toFixed();
	return bnStrToNumber(absVal, precision);
}

export function bnStrToPositiveNumber(val: string): number {
	return Math.max(0, bnStrToNumber(val));
}

export function replaceNaN(val: number, replaceWith: number): number {
	return isNaN(val) ? replaceWith : val;
}
export function bnStrToPrecision(val: string, precision?: number): string {
	return numberToCommas(bnStrToNumber(val, precision), precision);
}

export function bnStrToAbsPrecision(val: string, precision?: number): string {
	return numberToCommas(bnStrToAbsNumber(val, precision), precision);
}

export function bnStrToDollars(val: string, precision?: number, millify = true): string {
	return numberToDollars(bnStrToNumber(val, precision), precision, millify);
}

export function createDynamicUrl(dynamicUrl: string, object: any) {
	for (const key in object) {
		dynamicUrl = dynamicUrl.replace(`{${key}}`, object[key]);
	}
	return dynamicUrl;
}

export function capitalizeFirstLetter(str: string) {
	return str[0].toUpperCase() + str.slice(1).toLocaleLowerCase();
}

export const getMax = (a: number, b: number) => {
	return a > b ? a : b;
};

export const getMin = (a: number, b: number) => {
	return a < b ? a : b;
};

export const copyTextToClipboard = (text?: string) => {
	text && navigator.clipboard.writeText(text);
};

export const formatNumberWithMinimumDecimals = (
	number: number,
	minDecimals: number
): string => {
	const roundedNumber =
		Math.round(number * Math.pow(10, minDecimals)) / Math.pow(10, minDecimals);

	if (number % 1 !== 0 && roundedNumber % 1 === 0) {
		return number.toFixed(minDecimals);
	}

	return roundedNumber.toString();
};

export const trimSuiRejectionErrorMessage = (e: string) => {
	if (e.includes("[WALLET.SIGN_MSG_ERROR]") || e.includes("WALLET.SIGN_TX_ERROR")) {
		return e
			.replace("[WALLET.SIGN_MSG_ERROR]", "")
			.replace("[WALLET.SIGN_TX_ERROR]", "");
	}
	return e;
};
export const getUserFriendlyRejectionMessageForSui = (e: string) => {
	switch (e) {
		case "WALLET.SIGN_TX_ERROR":
			return "Signature Rejected By User";
		default:
			return e;
	}
};
export const trimNegativeSignFromPercentageIfZero = (percentage: string) => {
	return +percentage.replace("%", "") === 0 ? percentage.replace("-", "") : percentage;
};

export function getFlooredFixed(v: number, d: number) {
	return (Math.floor(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
}

// export function truncateToDecimalPlaces(value: number, decimalPlaces: number): number {
// 	const factor = Math.pow(10, decimalPlaces);
// 	return Math.trunc(value * factor) / factor;
// }

export function truncateToDecimalPlaces(value: number, decimalPlaces: number): string {
	const factor = Math.pow(10, decimalPlaces);
	const truncatedValue = Math.floor(value * factor) / factor;
	const formattedValue = truncatedValue.toFixed(decimalPlaces);
	return formattedValue;
}

export const isNumeric = (num: any) =>
	(typeof num === "number" || (typeof num === "string" && num.trim() !== "")) &&
	!isNaN(num as number);

export function isEmptyString(value: string): boolean {
	return value.trim() === "";
}
export const isEmpty = _.isEmpty;
export function getValue(object: object, path: string, defaultValue: any) {
	return _.get(object, path, defaultValue);
}

export const getEnv = () => {
	const processEnv = process.env.REACT_APP_ENV?.toLowerCase();
	if (processEnv === "mainnet") return "MAINNET";
	if (processEnv === "devnet") return "DEVNET";
	return "TESTNET";
};

export const handleNumberSanitizationWithPrecision = (
	assetSize: number,
	precision: number
) => {
	return BigNumber(assetSize).decimalPlaces(precision).toNumber();
};

export const sanitizeAccountAddress = (addr: string, network: "SUI" | "ARB") => {
	if (addr && addr.startsWith("0x")) addr = addr.substring(2);
	if (network == "SUI")
		return (
			"0x" +
			(
				"0000000000000000000000000000000000000000000000000000000000000000" +
				(addr || "").toLowerCase()
			).slice(-64)
		);
	else
		return (
			"0x" +
			(
				"0000000000000000000000000000000000000000" + (addr || "").toLowerCase()
			).slice(-40)
		);
};

export const percentageDifference = (oldValue: number, newValue: number) => {
	if (oldValue === 0) {
		throw new Error("Old value cannot be zero.");
	}

	let difference = newValue - oldValue;
	let percentageDiff = (difference / oldValue) * 100;

	return percentageDiff;
};

// Define interfaces for log levels
interface LogLevel {
	name: string;
	color: string;
	logFunction: (message: string) => void;
}

interface LogLevels {
	[key: string]: LogLevel;
}

// Color codes
export const COLOR_GREEN = "\x1b[32m";
export const COLOR_ORANGE = "\x1b[38;5;208m";
export const COLOR_BLUE = "\x1b[34m";
export const COLOR_RED = "\x1b[31m";
export const COLOR_YELLOW = "\x1b[33m";
export const COLOR_MAGENTA = "\x1b[35m";
export const COLOR_CYAN = "\x1b[36m";
const COLOR_RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

const defaultLogLevels: LogLevels = {
	info: { name: "INFO", color: COLOR_RESET, logFunction: console.log },
	warn: { name: "WARN", color: COLOR_ORANGE, logFunction: console.warn },
	error: { name: "ERROR", color: COLOR_RED, logFunction: console.error },
	debug: { name: "DEBUG", color: COLOR_BLUE, logFunction: console.debug },
	success: {
		name: "SUCCESS",
		color: COLOR_GREEN,
		logFunction: console.debug,
	},
};

const customLogLevels: LogLevels = {};

function formatDate(date: Date): string {
	const pad = (num: number, digits = 2): string =>
		num.toString().padStart(digits, "0");

	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
		date.getDate()
	)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
		date.getSeconds()
	)}.${pad(date.getMilliseconds(), 3)}`;
}

export function addCustomLogLevel(
	name: string,
	color: string,
	logFunction: (message: string) => void = console.log
): void {
	customLogLevels[name.toLowerCase()] = {
		name: name.toUpperCase(),
		color,
		logFunction,
	};
}

export function logWithLocation(message: string, level: string = "info"): void {
	const logLevel: LogLevel =
		customLogLevels[level.toLowerCase()] ||
		defaultLogLevels[level.toLowerCase()] ||
		defaultLogLevels.info;

	const stack = new Error().stack;
	const caller = stack?.split("\n")[2]?.trim();
	const match = caller?.match(/at.*?\s+\(?(.+):(\d+):(\d+)\)?$/);

	let fileName = "unknown";
	let line = "?";

	if (match) {
		[, fileName, line] = match;
		fileName = fileName.split("/").pop() || fileName;
	}

	const timestamp = formatDate(new Date());
	logLevel.logFunction(
		`${logLevel.color}--- ${COLOR_RESET}${fileName}${COLOR_BLUE}:${COLOR_ORANGE}${line},${COLOR_RESET} ${logLevel.color}${BOLD} [${logLevel.name}]${COLOR_RESET}  ${COLOR_BLUE}:${timestamp}:${logLevel.color}\n --- ${message}\n${logLevel.color}--- \n`
	);
}

export function logPerformance<T>(label: string, fn: () => T): T {
	const start = performance.now();
	const result = fn();
	const end = performance.now();
	logWithLocation(`${label} took ${(end - start).toFixed(3)}ms`, "debug");
	return result;
}

// Usage examples:
/*
 logWithLocation("This is an info message");
 logWithLocation("This is a warning message", 'warn');
 logWithLocation("This is an error message", 'error');
 logWithLocation("This is a debug message", 'debug');
 
 // Example of adding a custom log level
 addCustomLogLevel("CRITICAL", COLOR_MAGENTA);
 logWithLocation("This is a critical message", 'critical');
 
 // Example of performance logging
 const result = logPerformance('Heavy computation', () => {
    // Your heavy computation here
    return someResult;
 });
 */

import * as file from '#file';
import * as time from '#time';

const LEVELS = Object.freeze({
    CMD: 'CMD',
    LOAD: 'LOAD',
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
});

const COLORS = Object.freeze({
    CMD: '\x1b[0m',
    LOAD: '\x1b[32m',
    DEBUG: '\x1b[36m',
    INFO: '\x1b[0m',
    WARN: '\x1b[33m',
    ERROR: '\x1b[31m',
    RESET: '\x1b[0m'
});

const CONSOLE = {
    [LEVELS.CMD]: console.info,
    [LEVELS.LOAD]: console.info,
    [LEVELS.DEBUG]: console.debug,
    [LEVELS.INFO]: console.info,
    [LEVELS.WARN]: console.warn,
    [LEVELS.ERROR]: console.error
};

export function send(level, ...args) {
    const type = String(level).toUpperCase();
    const arg = args
        .map(a => typeof a === 'object' 
            ? JSON.stringify(a) : String(a))
        .join(' ');

    const data = 
        `[${time.getTime()}] [${type}] ${arg}`;

    const l = CONSOLE[type] ?? console.log;
    const color = COLORS[type] ?? COLORS.RESET;
    l(`${color}${data}${COLORS.RESET}`);

    return file.append(
        `logs/${time.getDate()}.log`, data);
}

export function cmd(...args) {
    return send(LEVELS.CMD, ...args);
}

export function load(...args) {
    return send(LEVELS.LOAD, ...args);
}

export function debug(...args) {
    return send(LEVELS.DEBUG, ...args);
}

export function info(...args) {
    return send(LEVELS.INFO, ...args);
}

export function warn(...args) {
    return send(LEVELS.WARN, ...args);
}

export function error(...args) {
    return send(LEVELS.ERROR, ...args);
}
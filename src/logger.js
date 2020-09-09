const chalk = require('chalk');
const sym = require('log-symbols');

const logger = console;

function log(msg, dim) {
    const formattedMsg = dim ? chalk.dim(msg) : msg;
    return logger.log(formattedMsg);
}

function logInfo(msg, icon = false, dim = false) {
    const msgWithIcon = icon ? `${sym.info} ${msg}` : msg;
    const formattedMsg = dim ? chalk.dim(msgWithIcon) : msgWithIcon;
    return logger.log(`${formattedMsg}`);
}

function logError(msg, icon = false, dim = false) {
    const msgWithIcon = icon ? `${sym.error} ${msg}` : msg;
    const formattedMsg = dim ? chalk.dim(msgWithIcon) : msgWithIcon;
    return logger.error(`${formattedMsg}`);
}

function logAndExit(msg, code) {
    const type = code !== 0 ? 'error' : 'log';
    const icon = type === 'error' ? `${chalk.red(sym.error)}` : `${chalk.green(sym.success)}`;
    logger[type](`${icon} ${msg}\n`);
    return process.exit(code || 0);
}

module.exports = {
    logger,
    log,
    logInfo,
    logError,
    logAndExit,
};

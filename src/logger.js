const chalk = require('chalk');
const sym = require('log-symbols');

const logger = console;

function log(msg, icon = false, dim = false) {
    const msgWithIcon = icon ? `${sym.info} ${msg}` : msg;
    const formattedMsg = dim ? chalk.dim(msgWithIcon) : msgWithIcon;
    return logger.log(`${formattedMsg}`);
}

function logWithNewLine(msg, icon = false, dim = false) {
    return log(`${msg}\n`, icon, dim);
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
    logAndExit,
    logWithNewLine,
};

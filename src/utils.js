const chalk = require('chalk');
const minimist = require('minimist');

const { log } = require('./logger');

const args = minimist(process.argv.slice(2));

const isHelpCmd = args._[0] === 'help' || Object.keys(args).find((k) => k === 'help' || k === 'h');

function showHelpMessage() {
    log(`${chalk.yellow(chalk.bold('USAGE'))}
  samwich <options>

${chalk.yellow(chalk.bold('EXAMPLES'))}
Search for the keyword plug
  samwich --keywords "plug"

Search for the keyword assembly and plug over the last 2 days
  samwich --keywords "assembly,plug" --lastPublishedDate 2

${chalk.yellow(chalk.bold('OPTIONS'))}
  --keywords             Keywords to search for, quoted and comma delimited ("plug", "assembly,plug", etc)
  --lastPublishedDate    How many days back to search (1, 2 or 3)
`);
    process.exit(0);
}

/**
 * Get and format keywords the keywords argument
 *
 * @return {Array} keywords
 */
function getKeywords() {
    const { keywords } = args;

    // If no keywords found, default to an empty array
    if (!keywords) {
        return [];
    }

    // If a comma exists, there is more than one keyword
    // We need to split them up
    if (keywords.includes(',')) {
        return keywords.split(',').map((k) => k.trim());
    }

    // Only one keyword
    return [keywords];
}

function getLastPublishedDate() {
    const supportedRanges = [1, 2, 3];
    const { lastPublishedDate } = args;

    // If no last published date passed, default to 1
    if (!lastPublishedDate) {
        return supportedRanges[0];
    }

    // If a comma exists, there is more than one keyword
    // We need to split them up
    if (supportedRanges.includes(lastPublishedDate)) {
        return lastPublishedDate;
    }

    // If the range is set but not supported, default to 1
    return supportedRanges[0];
}

function getSearchQueryByKeyword(params) {
    return Object.keys(params)
        .map((k) => {
            let value = encodeURIComponent(params[k]);
            // Keywords should be quoted when they have spaces, but beta.sam doesn't encode them
            if (k === 'keywords' && /\s/.test(value)) {
                value = `"${value}"`;
            }
            return `${k}=${value}`;
        })
        .join('&');
}

function convertMsToSeconds(ms, precision = 2) {
    return (ms / 1000).toFixed(precision);
}

function convertHrTimeToSeconds(hrtime, precision = 2) {
    const ms = hrtime[0] * 1e3 + hrtime[1] * 1e-6;
    return convertMsToSeconds(ms, precision);
}

module.exports = {
    args,
    convertHrTimeToSeconds,
    convertMsToSeconds,
    getKeywords,
    getLastPublishedDate,
    getSearchQueryByKeyword,
    isHelpCmd,
    showHelpMessage,
};

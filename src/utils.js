const fs = require('fs');

const chalk = require('chalk');
const minimist = require('minimist');
const { format } = require('date-fns');

const { log, logError } = require('./logger');

const {
    // EXPORT_BY_KEYWORD,
    EXPORT_FILENAME,
    EXPORT_PATH,
    EXPORT_RESULTS,
} = require('./config');

const args = minimist(process.argv.slice(2));

const isHelpCmd = args._[0] === 'help' || Object.keys(args).find((k) => k === 'help' || k === 'h');

function toKebabCase(s) {
    return s.replace(/\s+/g, '-').toLowerCase();
}

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
  --daics                NAICS to search for, quoted and comma delimited ("621511", "621511,21", etc)
  --lastPublishedDate    How many days back to search (1, 2 or 3)
`);
    process.exit(0);
}

/**
 * Get and format keywords the keywords argument
 *
 * @return {Array} keywords
 */
function parseCommaSeparatedArgument(argName) {
    const terms = args[argName] ? `${args[argName]}` : '';

    // If no terms found, default to an empty array
    if (!terms) {
        return [];
    }

    // If a comma exists, there is more than one term
    // We need to split them up
    if (terms.includes(',')) {
        return terms.split(',').map((k) => k.trim());
    }

    // Only one term
    return [terms];
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

function constructSearchQuery(params) {
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

/**
 * Takes an array of formatted search results and turns
 * it in to a comma separated file
 *
 * @param {Object} results
 */
function resultsToCsv(results) {
    // CSV headings from result key names
    const headings = Object.keys(results[0])
        .map((r) => `"${r}"`)
        .join(',');

    // CSV rows from results
    const data = results
        .map((result) => Object.values(result)
            .map((r) => `"${r}"`)
            .join(','))
        .join('\n');

    return `${headings}\n${data}`;
}

function exportToFile(termName, termValue, results) {
    if (!EXPORT_RESULTS) {
        // Exporting not enabled
        return;
    }

    if (!Array.isArray(results)) {
        logError('Results must be an array to export');
        return;
    }

    if (!results.length) {
        logError('Results are required to perform an export');
        return;
    }

    // TODO use EXPORT_BY_KEYWORD to export one file or multiple files

    const formattedDate = format(new Date(), 'ddMMyyyy');
    const formattedTerm = toKebabCase(`${termName}-${termValue}`);
    const exportFile = `${EXPORT_PATH}${formattedDate}-${formattedTerm}-${EXPORT_FILENAME}.csv`;
    fs.writeFile(exportFile, resultsToCsv(results), (err) => {
        if (err) {
            return logError(`Unable to log search results to ${exportFile}\n`);
        }

        return log(`Logged search results to ${exportFile}\n`);
    });
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
    constructSearchQuery,
    convertHrTimeToSeconds,
    convertMsToSeconds,
    exportToFile,
    getLastPublishedDate,
    isHelpCmd,
    parseCommaSeparatedArgument,
    resultsToCsv,
    showHelpMessage,
};

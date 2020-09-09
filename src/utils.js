const fs = require('fs');
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

function toKebabCase(s) {
    return s.replace(/\s+/g, '-').toLowerCase();
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

function exportToFile(keyword, results) {
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
    const formattedKeyword = toKebabCase(keyword);
    const exportFile = `${EXPORT_PATH}/${formattedDate}-${formattedKeyword}-${EXPORT_FILENAME}.csv`;
    fs.writeFile(exportFile, resultsToCsv(results), (err) => {
        if (err) {
            return logError(`Unable to log search results to ${exportFile}`);
        }

        return log(`Logged search results to ${exportFile}`);
    });
}

module.exports = {
    args,
    exportToFile,
    getKeywords,
    getLastPublishedDate,
    getSearchQueryByKeyword,
    resultsToCsv,
};

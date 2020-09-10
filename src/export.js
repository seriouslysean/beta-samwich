const fs = require('fs');

const { format } = require('date-fns');

const { log, logError } = require('./logger');

const {
    // EXPORT_BY_KEYWORD,
    EXPORT_FILENAME,
    EXPORT_PATH,
    EXPORT_RESULTS,
} = require('./config');

/**
 * Convert string to kebab case
 *   "Kebab Case" -> kebab-case
 *
 * @param   {string}    s string to convert
 * @returns {string}    kebab cased string
 */
function toKebabCase(s) {
    return s.replace(/\s+/g, '-').toLowerCase();
}

/**
 * Takes an array of results and converts it to comma separated
 * Each result will be on a new line with each key comma separated on a new line
 *
 * @param   {Array}     results array of search result
 * @returns {string}    comma separated results, one on each line
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

/**
 * Takes a comma separated string and saves it to a CSV file
 *
 * @param   {string}     prefix text to prefix the filename with
 * @param   {string}     results comma separated string of results
 * @returns {undefined}  No return value
 */
function exportToFile(prefix, results) {
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
    const formattedPrefix = toKebabCase(prefix);
    const exportFile = `${EXPORT_PATH}/${formattedDate}-${formattedPrefix}-${EXPORT_FILENAME}.csv`;
    fs.writeFile(exportFile, resultsToCsv(results), (err) => {
        if (err) {
            return logError(`Unable to log search results to ${exportFile}\n`);
        }

        return log(`Logged search results to ${exportFile}\n`);
    });
}

module.exports = {
    exportToFile,
    resultsToCsv,
};

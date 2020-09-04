const fs = require('fs');

const { EXPORT_RESULTS, EXPORT_FILE } = require('./config');

const logger = console;

/**
 * Takes an array of formatted search results and turns
 * it in to a comma separated file
 *
 * @param {object} results
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

function exportToFile(results) {
    if (!EXPORT_RESULTS) {
        logger.log();
        return;
    }

    if (!results) {
        logger.error('Results are required to perform an export');
        return;
    }

    fs.writeFile(EXPORT_FILE, resultsToCsv(results), (err) => {
        if (err) {
            return logger.log('Unable to log search results to ', EXPORT_FILE, err);
        }

        return logger.log('Logged search results to', EXPORT_FILE);
    });
}

module.exports = {
    logger,
    resultsToCsv,
    exportToFile,
};

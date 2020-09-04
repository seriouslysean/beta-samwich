const fs = require('fs');
const minimist = require('minimist');

const {
    EXPORT_RESULTS,
    EXPORT_PATH,
    EXPORT_FILENAME,
} = require('./config');

const logger = console;

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

    // If a comma exists, there is more than one keyword
    // We need to split them up
    if (keywords.includes(',')) {
        return keywords.split(',')
            .map((k) => k.trim());
    }

    // Only one keyword
    return [keywords];
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
        logger.log();
        return;
    }

    if (!results) {
        logger.error('Results are required to perform an export');
        return;
    }

    const exportFile = `${EXPORT_PATH}/${EXPORT_FILENAME}-${toKebabCase(keyword)}.csv`;
    fs.writeFile(exportFile, resultsToCsv(results), (err) => {
        if (err) {
            return logger.log('Unable to log search results to ', exportFile, err);
        }

        return logger.log('Logged search results to', exportFile);
    });
}

module.exports = {
    logger,
    args,
    getKeywords,
    getSearchQueryByKeyword,
    resultsToCsv,
    exportToFile,
};

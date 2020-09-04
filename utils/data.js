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

module.exports = {
    logger,
    resultsToCsv,
};

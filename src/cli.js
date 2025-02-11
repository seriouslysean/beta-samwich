const chalk = require('chalk');
const puppeteer = require('puppeteer');

const { SEARCH_BASE_URL } = require('./config');
const { ARG_NAME_KEYWORDS, ARG_NAME_NAICS } = require('./constants');
const {
    logAndExit,
    logError,
} = require('./logger');
const search = require('./search');
const { doSearchByParam } = require('./search');
const {
    convertHrTimeToSeconds,
    isHelpCmd,
    parseCommaSeparatedArgument,
    showHelpMessage,
} = require('./utils');

async function closeBrowserByReference(browser) {
    if (typeof browser.close === 'function') {
        return browser.close();
    }

    return false;
}

async function init() {
    if (isHelpCmd) {
        return showHelpMessage();
    }

    if (!SEARCH_BASE_URL) {
        return logAndExit('A Base Search Url is required to perform a search', 1);
    }

    // Get all search params (and strip empty terms)
    const searches = [
        ARG_NAME_KEYWORDS,
        ARG_NAME_NAICS,
    ].reduce((acc, termName) => {
        const terms = parseCommaSeparatedArgument(termName);
        terms.forEach((termValue) => acc.push({ termName, termValue }));
        return acc;
    }, []);

    if (!searches.length) {
        return logAndExit('One or more parameters are required to perform a search', 1);
    }

    const startTime = process.hrtime();

    // Start 'em up
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            // slowMo: 250,
        });
        // Disable cache on the first request to prevent any empty results
        const page = await browser.newPage();
        page.setCacheEnabled(false);

        // Search for each set of terms
        // Must use for loop so we actually wait for the search to finish
        for (let i = 0; i < searches.length; i += 1) {
            try {
                const { termName, termValue } = searches[i];
                // Allow await in loop so that all searches are done in order
                // This also ensures we aren't putting too much pressure on the site
                // eslint-disable-next-line no-await-in-loop
                await doSearchByParam(page, termName, termValue);
            } catch (err) {
                logError(`${err}\n`, true);
            }
        }
    } catch (err) {
        await closeBrowserByReference(browser);
        return logAndExit(err, 1);
    }

    await closeBrowserByReference(browser);

    const timeDifference = process.hrtime(startTime);
    const timeDifferenceString = chalk.blue(`(${convertHrTimeToSeconds(timeDifference)}s)`);
    return logAndExit(`Samwich CLI ran successfully! ${timeDifferenceString}`, 0);
}

module.exports = init;

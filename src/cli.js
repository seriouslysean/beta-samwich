const puppeteer = require('puppeteer');

const { SEARCH_BASE_URL } = require('./config');
const { logAndExit, logError } = require('./logger');
const { doSearchByKeyword } = require('./search');
const { getKeywords } = require('./utils');

async function closeBrowserByReference(browser) {
    if (typeof browser.close === 'function') {
        return browser.close();
    }

    return false;
}

async function init() {
    if (!SEARCH_BASE_URL) {
        return logAndExit('A Base Search Url is required to perform a search', 1);
    }

    const keywords = getKeywords();

    if (!keywords.length) {
        return logAndExit('One or more keywords are required to perform a search', 1);
    }

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

        for (let i = 0; i < keywords.length; i += 1) {
            try {
                // Allow await in loop so that all searches are done in order
                // This also ensures we aren't putting too much pressure on the site
                // eslint-disable-next-line no-await-in-loop
                await doSearchByKeyword(page, keywords[i]);
            } catch (err) {
                logError(`${err}\n`, true);
            }
        }
    } catch (err) {
        await closeBrowserByReference(browser);
        return logAndExit(err, 1);
    }

    await closeBrowserByReference(browser);

    return logAndExit('Samwich CLI ran successfully!', 0);
}

module.exports = init;

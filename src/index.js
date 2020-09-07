const puppeteer = require('puppeteer');

const { SEARCH_BASE_URL } = require('./config');
const { doSearchByKeyword } = require('./search');
const { logger, getKeywords } = require('./utils');

async function closeBrowserByReference(browser) {
    if (typeof browser.close === 'function') {
        return browser.close();
    }

    return false;
}

async function init() {
    if (!SEARCH_BASE_URL) {
        logger.error('A Base Search Url is required to perform a search');
        return process.exit(1);
    }

    const keywords = getKeywords();

    if (!keywords.length) {
        logger.error('One or more keywords are required to perform a search');
        process.exit(1);
    }

    // Start 'em up
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            // slowMo: 250,
        });
        const page = await browser.newPage();

        for (let i = 0; i < keywords.length; i += 1) {
            // Allow await in loop so that all searches are done in order
            // This also ensures we aren't putting too much pressure on the site
            // eslint-disable-next-line no-await-in-loop
            await doSearchByKeyword(page, keywords[i]);
        }
    } catch (err) {
        logger.error(err);
        await closeBrowserByReference(browser);
        return process.exit(1);
    }

    await closeBrowserByReference(browser);
    return process.exit(0);
}

module.exports = init;

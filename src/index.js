const puppeteer = require('puppeteer');

const { logger, getKeywords } = require('./utils');
const { doSearchByKeyword } = require('./search');

async function init() {
    const keywords = getKeywords();

    if (!keywords.length) {
        logger.error('One or more keywords are required to perform a search');
    }

    // Start 'em up
    const browser = await puppeteer.launch({
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

    // Shut 'em down
    await browser.close();
}

module.exports = init;

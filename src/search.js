const url = require('url');
const puppeteer = require('puppeteer');

const { logger, exportToFile } = require('./data');

// Global container for ids so we can avoid addiing duplicates
const RESULTS = [];
// const RESULT_IDS = [];

async function doSearch(searchUrl) {
    // Redefined within the puppeteer loop
    // This just prevents eslint from complaining below
    let window;
    let document;

    const browser = await puppeteer.launch({
        headless: true,
        // slowMo: 250,
    });
    const page = await browser.newPage();

    const goToUrl = async (pageUrl) => {
        // Load the initial search page
        // Search results aren't visible until the requests are finished
        // Requires the waitUntil because beta.sam is a SPA and relies on javascript
        // https://pptr.dev/#?product=Puppeteer&version=v2.1.1&show=api-pagegotourl-options
        await page.goto(pageUrl, { waitUntil: 'networkidle2' });

        // Grab all the results on a search page (10 per page as far as I can tell)
        // and put them in the results array
        const data = await page.evaluate(() => {
            const els = Array.from(document.querySelectorAll('#search-results .row'));

            // If there are no results, return empty handed
            if (!els.length) {
                return [];
            }

            // For each item, create a new object with the data we need
            const rows = [];
            els.forEach((el) => {
                const { hostname, protocol } = window.location;
                const host = `${protocol}//${hostname}`;
                const aside = el.querySelector('.four.wide.column .list');
                const href = el.querySelector('.opportunity-title a').getAttribute('href');
                const id = href.split('/')[2];

                // TODO dedupe

                rows.push({
                    category: aside.querySelector('li:nth-child(1)').innerText,
                    title: el.querySelector('.opportunity-title').innerText,
                    noticeId: aside.querySelector('li:nth-child(2) span').innerText,
                    currentDateOffersDue: aside.querySelector('li:nth-child(3) span').innerText,
                    lastModified: el.querySelector('.last-modified-date span').innerText,
                    lastPublished: el.querySelector('.last-published-date span').innerText,
                    type: el.querySelector('.opportunity-type span').innerText,
                    url: `${host}${href}`,
                    id,
                });
            });
            return rows;
        });

        // Add this page's results to the global results
        if (Array.isArray(data)) {
            logger.log('Results collected');
            RESULTS.push(...data);
        }

        // Is there another page of results?
        // If so, grab the url and navigate to it then recursively call
        // this function again
        const nextPageHandle = await page.$('.usa-pagination .page-next');
        if (nextPageHandle !== null) {
            const currentUrl = await page.url();
            const currentUrlParts = url.parse(currentUrl, true);
            const nextPage = parseInt(currentUrlParts.query.page, 10) + 1;
            currentUrlParts.query.page = nextPage;
            // Delete the search key so the url format will ignore it
            delete currentUrlParts.search;
            const nextPageUrl = url.format(currentUrlParts);
            logger.log('Starting search on page', nextPage);
            await goToUrl(nextPageUrl);
        }
    };

    // Start yer engines
    logger.log('\nInitializing');
    logger.log('Starting search on page', 1);
    await goToUrl(searchUrl);

    // Shut 'em down
    await browser.close();

    // Export to CSV if enabled
    exportToFile(RESULTS);
}

module.exports = {
    doSearch,
};

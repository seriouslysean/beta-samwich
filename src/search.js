const url = require('url');

const { SEARCH_BASE_URL } = require('./config');
const {
    exportToFile,
    getLastPublishedDate,
    getSearchQueryByKeyword,
    logger,
} = require('./utils');

// Global container for ids so we can avoid addiing duplicates
const RESULTS = [];
// const RESULT_IDS = [];

async function goToUrl(page, searchUrl) {
    // Load the initial search page
    // Search results aren't visible until the requests are finished
    // Requires the waitUntil because beta.sam is a SPA and relies on javascript
    // https://pptr.dev/#?product=Puppeteer&version=v2.1.1&show=api-pagegotourl-options
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    // Grab all the results on a search page (10 per page as far as I can tell)
    // and put them in the results array
    // Declare document/window here to prevent eslint errors below
    let document;
    let window;
    const data = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('#search-results .row'));

        // If there are no results, return empty handed
        if (!els.length) {
            return [];
        }

        // For each item, create a new object with the data we need
        const rows = [];
        els.forEach((el) => {
            const { hostname, protocol, search: queryString } = window.location;
            const host = `${protocol}//${hostname}`;
            const aside = el.querySelector('.four.wide.column .list');
            const href = el.querySelector('.opportunity-title a').getAttribute('href');
            const id = href.split('/')[2];
            // Get the keyword from the url, strip double quotes
            const urlParams = new URLSearchParams(queryString);
            const keyword = urlParams.get('keywords').replace(/['"]+/g, '');

            // TODO dedupe

            rows.push({
                keyword,
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
    if (!Array.isArray(data) || !data.length) {
        throw new Error('Unable to find any results');
    }

    logger.log('Results scraped');
    RESULTS.push(...data);

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
        await goToUrl(page, nextPageUrl);
    }
};

async function doSearchByKeyword(page, keyword) {
    // Start yer engines
    logger.log(`\nInitializing "${keyword}" search`);

    // Clear the results array for this search
    RESULTS.splice(0, RESULTS.length);

    // Construct the url query parameters
    const lastPublishedDate = getLastPublishedDate();
    const searchQuery = getSearchQueryByKeyword({
        keywords: `${keyword}`,
        sort: '-modifiedDate',
        index: 'opp',
        is_active: 'true',
        page: 1, // Always start on page 1
        opp_modified_date_filter_model: `{"timeSpan":"${lastPublishedDate}"}`,
        date_filter_index: 0,
        inactive_filter_values: 'false',
    });
    const searchUrl = `${SEARCH_BASE_URL}/search?${searchQuery}`;

    // Go to the page
    logger.log('Starting search on', searchUrl);
    await goToUrl(page, searchUrl);

    // Export to CSV if enabled
    exportToFile(keyword, RESULTS);
}

module.exports = {
    doSearchByKeyword,
};

const url = require('url');

const { SEARCH_BASE_URL, SEARCH_GLOBAL_DELAY } = require('./config');
const {
    exportToFile, getLastPublishedDate, getSearchQueryByKeyword, logger,
} = require('./utils');

// Global container for ids so we can avoid addiing duplicates
const RESULTS = {
    entries: [],
    totalPages: 0,
};
// const RESULT_IDS = [];

function waitForGlobalDelay(page) {
    logger.log(`> Waiting ${SEARCH_GLOBAL_DELAY}ms for the global delay`);
    return page.waitFor(SEARCH_GLOBAL_DELAY);
}

async function getSearchUrlByPage(page, pageNumber) {
    const currentUrl = await page.url();
    const currentUrlParts = url.parse(currentUrl, true);
    currentUrlParts.query.page = pageNumber;
    // Delete the search key so the url format will ignore it
    delete currentUrlParts.search;
    return url.format(currentUrlParts);
}

async function getPageNumber(page) {
    const currentUrl = await page.url();
    const currentUrlParts = url.parse(currentUrl, true);
    return parseInt(currentUrlParts.query.page, 10);
}

async function goToUrl(page, searchUrl) {
    // Load the initial search page
    // Search results aren't visible until the requests are finished
    // Requires the waitUntil because beta.sam is a SPA and relies on javascript
    // https://pptr.dev/#?product=Puppeteer&version=v2.1.1&show=api-pagegotourl-options
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    // How many pages did we actually find?
    const currentPageNumber = await getPageNumber(page);
    const lastPageHandle = await page.$('.usa-pagination li:nth-last-child(2) > a');
    if (RESULTS.totalPages === 0) {
        RESULTS.totalPages = lastPageHandle !== null
            ? await page.evaluate((el) => el.innerText, lastPageHandle) : 1;
    }
    logger.log(`🔍 Searching page ${currentPageNumber} of ${RESULTS.totalPages}`);

    // Grab all the results on a search page (10 per page as far as I can tell)
    // and put them in the results array
    // Declare document/window here to prevent eslint errors below
    let document;
    let window;
    const data = (await page.evaluate(() => {
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
    })) || [];

    // Add this page's results to the global results
    if (!data.length) {
        throw new Error('Unable to find any results');
    }

    // Add results to the global results array
    RESULTS.entries.push(...data);

    // If there is another page of results, grab the url and navigate
    // to it then recursively call this function again
    const nextPageHandle = await page.$('.usa-pagination .page-next');
    if (nextPageHandle !== null) {
        const nextPageUrl = await getSearchUrlByPage(page, currentPageNumber + 1);
        // Delay the next search by the global interval to prevent hammering
        // the service too much
        await waitForGlobalDelay(page);
        await goToUrl(page, nextPageUrl);
    }
}

async function doSearchByKeyword(page, keyword) {
    // Start yer engines
    logger.log(`\nInitializing "${keyword}" search`);

    // Clear the results array for this search
    RESULTS.entries.splice(0, RESULTS.entries.length);
    // Reset our total pages
    RESULTS.totalPages = 0;

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
    exportToFile(keyword, RESULTS.entries);
}

module.exports = {
    doSearchByKeyword,
};

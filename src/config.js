module.exports = {
    EXPORT_BY_KEYWORD: process.env.SW_EXPORT_BY_KEYWORD,
    EXPORT_FILENAME: process.env.SW_EXPORT_FILENAME,
    EXPORT_PATH: process.env.SW_EXPORT_PATH,
    EXPORT_RESULTS: process.env.SW_EXPORT_RESULTS,
    SEARCH_BASE_URL: process.env.SW_SEARCH_BASE_URL,
    SEARCH_GLOBAL_DELAY: process.env.SW_SEARCH_GLOBAL_DELAY
        ? parseInt(process.env.SW_SEARCH_GLOBAL_DELAY, 10) : 1000,
};

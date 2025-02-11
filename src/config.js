function getValueAsInt(key) {
    const env = process.env[key];

    if (!env) {
        return undefined;
    }

    return parseInt(env, 10);
}

module.exports = {
    EXPORT_BY_KEYWORD: process.env.SW_EXPORT_BY_KEYWORD,
    EXPORT_FILENAME: process.env.SW_EXPORT_FILENAME,
    EXPORT_PATH: process.env.SW_EXPORT_PATH,
    EXPORT_RESULTS: process.env.SW_EXPORT_RESULTS,
    SEARCH_BASE_URL: process.env.SW_SEARCH_BASE_URL,
    SEARCH_GLOBAL_DELAY: getValueAsInt('SW_SEARCH_GLOBAL_DELAY') || 1000,
    SEARCH_MAX_RETRIES_ON_ERROR: getValueAsInt('SW_SEARCH_MAX_RETRIES_ON_ERROR') || 3,
};

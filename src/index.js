const { doSearch } = require('./search');

function init() {
    // Hardcoded for now (plug - past day, page 1)
    // TODO make keywords dynamic
    doSearch('https://beta.sam.gov/search?keywords=plug&sort=-modifiedDate&index=opp&is_active=true&page=1&opp_modified_date_filter_model=%7B%22timeSpan%22:%221%22%7D&date_filter_index=0&inactive_filter_values=false');
}

module.exports = init;

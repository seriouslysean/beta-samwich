#!/usr/bin/env node
require('dotenv').config({ path: '.env' });

const { sandwich } = require('./src/art');
const { logger } = require('./src/utils');
const init = require('./src/cli');

// ¯\_(ツ)_/¯
logger.log(sandwich);

// Bootstrap the app
init();

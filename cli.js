#!/usr/bin/env node
require('dotenv').config({ path: '.env' });

const sandwich = require('./src/sandwich');
const { logger } = require('./src/utils');
const init = require('./src');

// ¯\_(ツ)_/¯
logger.log(sandwich);

// Bootstrap the app
init();
#!/usr/bin/env NODE_OPTIONS=--no-warnings node
require('dotenv').config({ path: '.env' });

const { sandwich } = require('./src/art');
const { logger } = require('./src/logger');
const init = require('./src/cli');

// ¯\_(ツ)_/¯
logger.log(sandwich);

// Bootstrap the app
init();

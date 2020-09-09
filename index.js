#!/usr/bin/env NODE_OPTIONS=--no-warnings node
require('dotenv').config({ path: '.env' });

const { sandwich } = require('./src/art');
const { log } = require('./src/logger');
const init = require('./src/cli');

// ¯\_(ツ)_/¯
log(sandwich);

// Bootstrap the app
init();

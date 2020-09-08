/* eslint-disable no-useless-escape */

const chalk = require('chalk');
const pJson = require('../package.json');

const sandwich = chalk.yellow(`

                          ____
              .----------'    '-.
             /  .      '     .   \\
            /        '    .      /|
           /      .             \ /
          /  ' .       .     .  | |
         /.___________    '    / //
         |._          '------'| /|
         '.............______.-' /     beta.sam.gov cli
         |-.                  | /      ${chalk.dim(pJson.version)}
         '"""""""""""""-.....-'

`);

module.exports = {
    sandwich,
};

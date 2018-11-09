
const chalk = require('chalk')
const consoleVersion = require('./version')
const { version } = require('../package.json')
 
console.log(`
Welcome to`)
consoleVersion()
console.log(`
                                        version: ${chalk.green(version)} 
=========================================================
`)
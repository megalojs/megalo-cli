#!/usr/bin/env node
const sao = require('sao')
const path = require('path')
const minimist = require('minimist')
const lv = require('latest-version')
const { version: localVersion } = require('./package.json')
const { version: consoleVersion, help: consoleHelp } = require('./util')

const argv = minimist(process.argv.slice(2))
const { h, help: _h, v, version: _v, f, force: _f } = argv
// In a custom directory or current directory
let latestVersion = 0

let hasNewVersion = false

;(async () => {
  latestVersion = await lv('@megalo/cli')
  hasNewVersion = consoleVersion(localVersion, latestVersion, v || _v)

  if (h || _h) {
    return consoleHelp()
  } else if (v || _v || (hasNewVersion && !f && !_f)) {
    return
  }

  sao({
    // The path to your template
    generator: path.join(__dirname, '.'),
    outDir: path.resolve(argv._[0] || '.')
  })
  .run()
  .catch(sao.handleError)
})()

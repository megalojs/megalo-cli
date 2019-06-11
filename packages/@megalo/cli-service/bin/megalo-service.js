#!/usr/bin/env node

const semver = require('semver')
const { error } = require('@megalo/cli-share-utils')
const requiredVersion = require('../package.json').engines.node
if (!semver.satisfies(process.version, requiredVersion)) {
  error(
    `You are using Node ${process.version}, but @megalo/cli-service ` +
    `requires Node ${requiredVersion}.\nPlease upgrade your Node version.`
  )
  process.exit(1)
}

const Service = require('../lib/Service.js')
const service = new Service(process.env.MEGALO_CLI_CONTEXT || process.cwd())

const rawArgv = process.argv.slice(2)
const args = require('minimist')(process.argv.slice(2), {
  boolean: [
    // build
    'no-clean',
    'report',
    'report-json',
    'watch'
    // serve
  ]
})
const command = args._[0]
// console.log('参数:', args)
// console.log('命令:', command)
// console.log('原始参数：', rawArgv)

service.run(command, args, rawArgv).catch(err => {
  error(err)
  process.exit(1)
})

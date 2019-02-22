#!/usr/bin/env node

const program = require('commander')

program
  .usage('[commands] [options] [pattern]')
  .option('--mode <mode>', 'specify env mode (default: development)', 'development')
  .option('--platform <platform>', 'set target platform (default: wechat)', 'wechat')
  .option('--report', 'generate report.html to help analyze bundle content (default: false)', false)
  .option('--fix', 'eslint auto fix on save (default: false)', false)

program
  .command('serve')
  .description('以开发模式启动编译')
  .action(() => {
    console.log('开发模式启动了')
  })

program
  .command('build')
  .description('以生产模式启动编译')
  .action(() => {
    console.log('生产模式启动了')
  })

program.parse(process.argv)

#!/usr/bin/env node

// 检查nodeJs版本
const semver = require('semver')
const { error } = require('@vue/cli-shared-utils')
const requiredVersion = require('../package.json').engines.node
if (!semver.satisfies(process.version, requiredVersion)) {
  error(
    `You are using Node ${process.version}, but @megalo/cli-service ` +
    `requires Node ${requiredVersion}.\nPlease upgrade your Node version.`
  )
  process.exit(1)
}

// 注册控制台选项及命令
const program = require('commander')
const Service = require('../lib/Service')
const service = new Service(process.cwd())

program
  .usage('[commands] [options] [pattern]')
  .option('--mode <mode>', 'specify env mode (default: serve => development, build => production)')
  .option('--platform <platform>', 'set target platform (default: wechat)', /^(wechat|alipay|swan)$/i, 'wechat')
  .option('--report', 'generate report.html to help analyze bundle content (default: false)', false)
  .option('--fix', 'eslint auto fix on save (default: false)', false)

program
  .command('serve')
  .description('以开发模式启动编译')
  .action(command => {
    program.mode === undefined && (program.mode = 'development')
    // 默认NODE_ENV，可在.env文件中覆写
    process.env.NODE_ENV = 'development'

    service.run(command.name(), program.opts()).catch(err => {
      error(err)
      process.exit(1)
    })
  })

program
  .command('build')
  .description('以生产模式启动编译')
  .action(() => {
    program.mode === undefined && (program.mode = 'production')
    process.env.NODE_ENV = 'production'

    service.run(command.name(), program.opts()).catch(err => {
      error(err)
      process.exit(1)
    })
  })

program
  .command('lint')
  .description('修复代码格式')
  .action(() => {
    console.log('TODO')
  })

program.parse(process.argv)

#!/usr/bin/env node

// 检查nodeJs版本
const semver = require('semver')
const { error, info } = require('@vue/cli-shared-utils')
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
const path = require('path')
const Service = require('../lib/Service')
const service = new Service(process.env.MEGALO_CLI_CONTEXT || process.cwd())

const run = async (commandName = 'serve', commandOptions = { mode: 'development', platform: 'wechat', config: '', report: false, fix: false, debug: false }) => {
  try {
    const projectOptions = await service.run(commandName, commandOptions)
    let webpackFn
    // 执行默认的配置文件，或者用户自定义的webpack配置文件
    if (commandOptions.config) {
      commandOptions.config = path.resolve(process.env.MEGALO_CLI_CONTEXT, commandOptions.config)
      try {
        webpackFn = require(commandOptions.config)
      } catch (err) {
        throw new Error(`Cannot find module "${commandOptions.config}", \n Please check the "--confg" option`)
      }
    } else {
      webpackFn = require('@megalo/cli-webpack-config')
    }
    if (typeof webpackFn !== 'function') {
      throw new Error(`Your customer webpack config must export a function`)
    }

    info(`  当前编译平台：${commandOptions.platform}`)
    info(`  环境变量NODE_ENV：${process.env.NODE_ENV}`)

    webpackFn(commandName, commandOptions, projectOptions)
  } catch (err) {
    error(err)
    process.exit(1)
  }
}

program
  .usage('[Commands] [Options] [pattern]')
  .option('--mode <mode>', 'specify env mode (default: serve => development, build => production)')
  .option('--platform <platform>', 'set target platform ', /^(wechat|alipay|swan|tt|h5)$/i, 'wechat')
  .option('--config <path>', 'set customer webpack config path ', '')
  .option('--report', 'generate report.html to help analyze bundle content ', false)
  .option('--fix', 'eslint auto fix on save ', false)
  .option('--debug', 'open the debug logger ', false)

program
  .command('serve')
  .description('以开发模式启动编译。mode默认值：development, platform默认值： wechat')
  .action(command => {
    program.mode === undefined && (program.mode = 'development')
    // 设置默认NODE_ENV，可在.env文件中覆写
    process.env.NODE_ENV = 'development'

    run(command.name(), program.opts())
  })

program
  .command('build')
  .description('以生产模式启动编译。mode默认值：production, platform默认值： wechat')
  .action(command => {
    program.mode === undefined && (program.mode = 'production')
    process.env.NODE_ENV = 'production'

    run(command.name(), program.opts())
  })

program
  .command('lint')
  .description('修复代码格式')
  .action(() => {
    console.log('TODO')
  })

program.on('--help', () => {
  console.log('')
  console.log('Examples:')
  console.log('  $ megalo-cli-service serve --platform wechat --mode development')
  console.log('  $ megalo-cli-service build --platform wechat')
  console.log('  $ megalo-cli-service --help')
})

program.parse(process.argv)

if (program.args.length && typeof program.args[0] === 'string') {
  error(`Unknown command \`${program.args[0]}\`\n`)
  program.help()
} else if (!program.args.length) {
  program.help()
}

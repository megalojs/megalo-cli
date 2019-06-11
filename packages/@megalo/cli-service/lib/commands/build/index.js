const modifyConfig = (config, fn) => {
  if (Array.isArray(config)) {
    config.forEach(c => fn(c))
  } else {
    fn(config)
  }
}

const defaults = {
  clean: true,
  watch: false
}

module.exports = (api, options) => {
  api.registerCommand('build', {
    description: 'build for production',
    usage: 'megalo-cli-service build [options] [entry|pattern]',
    options: {
      '--mode': `specify env mode (default: production)`,
      '--no-clean': `do not remove the dist directory before building the project`,
      '--report': `generate report.html to help analyze bundle content`,
      '--report-json': 'generate report.json to help analyze bundle content',
      '--watch': `watch for changes`
    }
  }, async (args, rawArgs) => {
    for (const key in defaults) {
      if (args[key] == null) {
        args[key] = defaults[key]
      }
    }

    const fs = require('fs-extra')
    const path = require('path')
    const chalk = require('chalk')
    const webpack = require('webpack')
    const formatStats = require('./formatStats')
    const { log, done, logWithSpinner, stopSpinner } = require('@megalo/cli-share-utils')

    const mode = api.service.mode
    const platform = args.platform
    const targetDir = api.resolve(`dist-${platform}`)

    log()
    logWithSpinner(`Building ${platform} for ${mode}...`)
    log()
    const webpackConfig = api.resolveWebpackConfig()

    // 监听文件改动
    if (args.watch) {
      modifyConfig(webpackConfig, config => {
        config.watch = true
      })
    }

    // 生成分析报告
    if (args.report || args['report-json']) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      modifyConfig(webpackConfig, config => {
        config.plugins.push(new BundleAnalyzerPlugin({
          logLevel: 'warn',
          openAnalyzer: false,
          analyzerMode: args.report ? 'static' : 'disabled',
          reportFilename: `../${platform}-report.html`,
          statsFilename: `../${platform}-report.json`,
          generateStatsFile: !!args['report-json']
        }))
      })
    }

    // 构建前先清空目录
    if (args.clean) {
      await fs.remove(targetDir)
    }

    return new Promise((resolve, reject) => {
      webpack(webpackConfig, (err, stats) => {
        stopSpinner(false)
        if (err) {
          return reject(err)
        }

        if (stats.hasErrors()) {
          return reject(`Build failed with errors.`)
        }

        const targetDirShort = path.relative(
          api.service.context,
          targetDir
        )
        log(formatStats(stats, targetDirShort, api))
        if (!args.watch) {
          done(`Build complete. The compiled files are in directory ${chalk.cyan(targetDirShort)}. (*^▽^*) Enjoy it~`)
        } else {
          done(`Build complete. Watching for changes...`)
        }

        resolve()
      })
    })
  })
}

module.exports.defaultModes = {
  build: 'production'
}

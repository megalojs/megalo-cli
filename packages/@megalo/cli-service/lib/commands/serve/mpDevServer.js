const { info, done } = require('@megalo/cli-share-utils')

module.exports = async (api, options, args) => {
  const webpack = require('webpack')
  const WebpackDevServer = require('webpack-dev-server')

  const platform = args.platform
  const targetDir = api.resolve(`dist-${platform}`)

  const webpackConfig = api.resolveWebpackConfig()
  const compiler = webpack(webpackConfig)
  // 编译小程序可能不需要这个？
  const server = new WebpackDevServer(compiler, {
    quiet: true,
    contentBase: targetDir,
    clientLogLevel: 'none',
    writeToDisk: true,
    hot: false,
    inline: false,
    watchOptions: { ignored: /node_modules/ }
  })

  ;['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      server.close(() => {
        process.exit(0)
      })
    })
  })

  return new Promise((resolve, reject) => {
    // log instructions & open browser on first compilation complete
    let isFirstCompile = true
    compiler.hooks.done.tap('megalo-cli-service serve', stats => {
      if (stats.hasErrors()) {
        return
      }

      console.log()
      done(`  Your miniprogram application has been compiled successfully`)
      console.log()

      if (isFirstCompile) {
        isFirstCompile = false
        info(`  You can access documents for more help: https://megalojs.org/#/cli/cli-service`)
        console.log()

        // resolve returned Promise
        // so other commands can do api.service.run('serve').then(...)
        resolve()
      }
    })
  })
}

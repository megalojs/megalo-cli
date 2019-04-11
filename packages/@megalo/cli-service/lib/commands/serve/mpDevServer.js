const { info, done } = require('@megalo/cli-share-utils')

module.exports = async (api, options, args) => {
  const webpack = require('webpack')
  const WebpackDevServer = require('webpack-dev-server')

  const webpackConfig = api.resolveWebpackConfig()
  const compiler = webpack(webpackConfig)
  const server = new WebpackDevServer(compiler, {
    quiet: true
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

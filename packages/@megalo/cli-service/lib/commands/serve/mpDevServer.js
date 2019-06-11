const { info, done } = require('@megalo/cli-share-utils')

module.exports = async (api, options, args) => {
  const webpack = require('webpack')
  const WebpackDevServer = require('webpack-dev-server')
  const fs = require('fs-extra')

  const platform = args.platform
  const targetDir = api.resolve(`dist-${platform}`)

  // 小程序构建前先清空目录（若不清空，错误代码也会被小程序开发工具编译）
  await fs.remove(targetDir)

  const webpackConfig = api.resolveWebpackConfig()
  const compiler = webpack(webpackConfig)
  // 一般情况下，编译小程序可能不需要这个，因为没有热更新；不过部分插件可能需要开启一个服务器
  // TODO 可注入中间件
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

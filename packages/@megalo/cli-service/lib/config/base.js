/**
 * 一些小程序和web公用的web配置
 */

const webpack = require('webpack')

module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    const platform = process.env.PLATFORM
    const resolveLocal = require('../util/resolveLocal')
    webpackConfig
      .mode(process.env.NODE_ENV === 'production' ? 'production' : 'development')
      .context(api.service.context)
      .entry('app')
        .clear()
        .add('./src/main.js')

    webpackConfig
      .output
      .path(api.resolve(`dist-${platform}/`))
      .filename('static/js/[name].js')
      .chunkFilename('static/js/[name].js')

    webpackConfig.resolve
    .extensions
      .merge(['.js', '.vue', '.json'])
      .end()
    .modules
      .add('node_modules')
      .add(api.resolve('node_modules'))
      .add(resolveLocal('node_modules'))
      .end()
    .alias
      .set('@', api.resolve('src'))

    webpackConfig.resolveLoader
    .modules
      .add('node_modules')
      .add(api.resolve('node_modules'))
      .add(resolveLocal('node_modules'))

    webpackConfig.module
      .noParse(/^(vue|vue-router|vuex|vuex-router-sync)$/)

    // shims
    webpackConfig.node
      .merge({
        // prevent webpack from injecting useless setImmediate polyfill because Vue
        // source contains it (although only uses it if it's native).
        setImmediate: false,
        // process is injected via EnvironmentPlugin, although some 3rd party
        // libraries may require a mock to work properly (#934)
        process: 'mock',
        // prevent webpack from injecting mocks to Node native modules
        // that does not make sense for the client
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty'
      })

    // plugins ------------------------------------------------------------------------
    // 友好错误显示
    const { transformer, formatter } = require('../util/resolveLoaderError')
    webpackConfig
      .plugin('friendly-errors')
        .use(require('@soda/friendly-errors-webpack-plugin'), [{
          additionalTransformers: [transformer],
          additionalFormatters: [formatter]
        }])

    // 替换环境变量
    const resolveClientEnv = require('../util/resolveClientEnv')
    webpackConfig
      .plugin('process-env')
        .use(webpack.EnvironmentPlugin, [
          resolveClientEnv()
        ])

    webpackConfig
    .plugin('case-sensitive-paths')
      .use(require('case-sensitive-paths-webpack-plugin'))
  })
}

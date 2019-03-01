const merge = require('webpack-merge')
const createBaseConfig = require('./webpack.base.config')

module.exports = (...args) => {
  const webpackBaseConfig = createBaseConfig(...args)

  return merge(webpackBaseConfig, {
    mode: 'development',
    watch: true,
    devServer: {
      progress: true,
      quiet: true
    },
    devtool: 'cheap-source-map'
  })
}

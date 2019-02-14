const webpackBaseConfig = require('./webpack.base.config')
const merge = require('webpack-merge')

module.exports = merge(webpackBaseConfig, {
  mode: 'development',
  watch: true,
  devServer: {
    progress: true,
    quiet: true
  },
  devtool: 'cheap-source-map'
})

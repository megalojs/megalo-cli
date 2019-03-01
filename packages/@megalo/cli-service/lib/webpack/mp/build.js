const merge = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const createBaseConfig = require('./webpack.base.config')
const { getCssExt } = require('./util')

module.exports = (commandName, commandOptions, projectOptions) => {
  const webpackBaseConfig = createBaseConfig(commandName, commandOptions, projectOptions)
  const webpackConfig = merge(webpackBaseConfig, {
    mode: 'production',
    devtool: projectOptions.productionSourceMap ? 'cheap-source-map' : 'none',
    optimization: {
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: projectOptions.productionSourceMap ? 'cheap-source-map' : false
        }),
        new OptimizeCSSAssetsPlugin({
          assetNameRegExp: new RegExp(`\\.${getCssExt(process.env.PLATFORM)}$`, 'g')
        })
      ]
    }
  })

  if (commandOptions.report === true) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
  }
  return webpackConfig
}

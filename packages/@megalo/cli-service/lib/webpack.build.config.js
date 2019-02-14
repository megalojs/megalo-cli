const merge = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const webpackBaseConfig = require('./webpack.base.config')
const defaultConfig = require('./megalo.default.config')
const { getCssExt } = require('./util')
const cssExt = getCssExt(process.env.PLATFORM)

const webpackConfig = merge(webpackBaseConfig, {
  mode: 'production',
  devtool: defaultConfig.build.sourceMap,
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: defaultConfig.build.sourceMap === 'none' ? false : !!defaultConfig.build.sourceMap
      }),
      new OptimizeCSSAssetsPlugin({
        assetNameRegExp: new RegExp(`\\.${cssExt}$`, 'g')
      })
    ]
  }
})

if (defaultConfig.build.bundleAnalyzerReport === true) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig

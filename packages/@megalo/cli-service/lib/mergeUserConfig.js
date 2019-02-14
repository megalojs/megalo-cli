/**
 * 如果用户在项目根目录下的megalo.config.js里配置了｀configureWebpack｀选项，则使用webpackMerge将其合并
 */
const webpackMerge = require('webpack-merge')
const defaultConfig = require('./megalo.default.config')

/** 合并用户修改后的webpack配置 */
exports.mergeUserConfig = (webpackConfig) => {
  // 合并用户自定义webpack配置
  if (typeof defaultConfig.configureWebpack === 'function') {
    const returnConfig = defaultConfig.configureWebpack(webpackConfig)
    // 若没有直接修改传入进去的配置，而是返回了一个新的配置对象，就merge处理
    if (returnConfig && returnConfig !== webpackConfig) {
      webpackConfig = webpackMerge(webpackConfig, returnConfig)
    }
  }
  return webpackConfig
}

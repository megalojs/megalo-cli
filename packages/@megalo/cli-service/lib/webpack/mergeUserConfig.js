/**
 * 如果用户在项目根目录下的megalo.config.js里配置了｀configureWebpack｀选项，则使用webpackMerge将其合并
 */
const webpackMerge = require('webpack-merge')

/** 合并用户修改后的webpack配置 */
exports.mergeUserConfig = (chainConfig, projectOptions) => {
  // 合并用户自定义配置项 "chainWebpack"
  if (projectOptions.chainWebpack) {
    projectOptions.chainWebpack(chainConfig)
  }
  let finalWebpack = chainConfig.toConfig()
  // 合并用户自定义webpack配置项 "configureWebpack"
  if (typeof projectOptions.configureWebpack === 'function') {
    const returnConfig = projectOptions.configureWebpack(finalWebpack)
    // 若没有直接修改传入进去的配置，而是返回了一个新的配置对象，就merge处理
    if (returnConfig && returnConfig !== finalWebpack) {
      finalWebpack = webpackMerge(finalWebpack, returnConfig)
    }
  }
  return finalWebpack
}

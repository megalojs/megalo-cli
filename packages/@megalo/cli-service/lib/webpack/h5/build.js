const ChainableWebpackConfig = require('webpack-chain')
const { error } = require('@vue/cli-shared-utils')

module.exports = (commandName, commandOptions, projectOptions) => {
  error('暂时不支持编译h5,敬请期待')

  const chainConfig = new ChainableWebpackConfig()
  chainConfig.when(projectOptions.report, config => {
    config.plugin('bundle-analyzer')
      .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
  })
  return chainConfig
}

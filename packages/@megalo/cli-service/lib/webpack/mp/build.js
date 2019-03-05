const createBaseConfig = require('./webpack.base.config')

module.exports = (commandName, commandOptions, projectOptions) => {
  const chainConfig = createBaseConfig(commandName, commandOptions, projectOptions)
  chainConfig.when(projectOptions.report, config => {
    config.plugin('bundle-analyzer')
      .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
  })
  return chainConfig
}

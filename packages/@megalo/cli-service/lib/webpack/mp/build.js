const createBaseConfig = require('./webpack.base.config')

module.exports = (commandName, commandOptions, projectOptions) => {
  const chainConfig = createBaseConfig(commandName, commandOptions, projectOptions)
  chainConfig.when(commandOptions.report || commandOptions.reportJson, config => {
    config.plugin('bundle-analyzer')
      .use(
        require('webpack-bundle-analyzer').BundleAnalyzerPlugin,
        [{
          analyzerMode: commandOptions.report ? 'static' : 'disabled',
          reportFilename: `../${commandOptions.platform}-report.html`,
          statsFilename: `../${commandOptions.platform}-report.json`,
          generateStatsFile: !!commandOptions.reportJson
        }]
      )
  })
  return chainConfig
}

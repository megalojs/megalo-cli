// 非cli环境，生成的webpack配置文件（主要用于测试用例）

const Service = require('./Service')
const service = new Service(process.env.MEGALO_CLI_CONTEXT || process.cwd())
const commandName = process.env.MEGALO_CLI_COMMAND || 'serve'
const platform = process.env.MEGALO_CLI_MODE || 'wechat'
const mode = process.env.MEGALO_CLI_MODE || 'development'

process.env.NODE_ENV = (commandName === 'serve' ? 'development' : 'production')

service.init(process.env.MEGALO_CLI_MODE || process.env.NODE_ENV)

const { mergeUserConfig } = require('./webpack/mergeUserConfig')
let finalWebpackConfig = (platform === 'h5' ? require(`./webpack/h5/${commandName}`) : require(`./webpack/mp/${commandName}`))(
  commandName,
  { mode, platform, config: '', report: false, fix: false, debug: false },
  service.projectOptions
)
finalWebpackConfig = mergeUserConfig(finalWebpackConfig, service.projectOptions)

console.log(JSON.stringify(finalWebpackConfig))

module.exports = finalWebpackConfig

const ChainableWebpackConfig = require('webpack-chain')
const { error } = require('@vue/cli-shared-utils')
module.exports = (...args) => {
  error('暂不支持编译h5,敬请期待')

  const chainConfig = new ChainableWebpackConfig()
  chainConfig
  .watch(true)
  .devServer
    .progress(true)
    .quiet(true)

  return chainConfig
}

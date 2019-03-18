const createBaseConfig = require('./webpack.base.config')

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

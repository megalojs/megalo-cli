const createBaseConfig = require('./webpack.base.config')

module.exports = (...args) => {
  const chainConfig = createBaseConfig(...args)

  chainConfig
  .watch(true)
  .devServer
    .progress(true)
    .quiet(true)

  return chainConfig
}

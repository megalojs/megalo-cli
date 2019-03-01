const romoveFile = require('rimraf')
const path = require('path')
const webpack = require('webpack')

module.exports = (...args) => {
  const commandName = args[0]
  const finalWebpackConfig = (process.env.PLATFORM === 'h5' ? require(`./h5/${commandName}`) : require(`./mp/${commandName}`))(...args) || {}
  romoveFile(path.resolve(`dist-${process.env.PLATFORM}/*`), error => {
    if (error) throw error
    webpack(finalWebpackConfig, () => {})
  })
}


const romoveFile = require('rimraf')
const path = require('path')
const webpack = require('webpack')
const { mergeUserConfig } = require('./mergeUserConfig')

module.exports = (...args) => {
  const commandName = args[0]
  const projectOptions = args[2]

  let finalWebpackConfig = (process.env.PLATFORM === 'h5' ? require(`./h5/${commandName}`) : require(`./mp/${commandName}`))(...args) || {}
  finalWebpackConfig = mergeUserConfig(finalWebpackConfig, projectOptions)

  romoveFile(path.resolve(`dist-${process.env.PLATFORM}/*`), error => {
    if (error) throw error
    webpack(finalWebpackConfig, () => {})
  })
}


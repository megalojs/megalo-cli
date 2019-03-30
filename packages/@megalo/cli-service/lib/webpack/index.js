const fs = require('fs-extra')
const path = require('path')
const webpack = require('webpack')
const { mergeUserConfig } = require('./mergeUserConfig')

module.exports = async (...args) => {
  const commandName = args[0]
  const projectOptions = args[2]

  const chainConfig = (process.env.PLATFORM === 'h5' ? require(`./h5/${commandName}`) : require(`./mp/${commandName}`))(...args) || {}
  const finalWebpackConfig = mergeUserConfig(chainConfig, projectOptions)

  await fs.remove(path.resolve(`dist-${process.env.PLATFORM}/*`))
  webpack(finalWebpackConfig, () => {})
}

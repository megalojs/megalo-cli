#!/usr/bin/env node

// 检查nodeJs版本
const semver = require('semver')
const { error } = require('./util')
const requiredVersion = require('../package.json').engines.node
if (!semver.satisfies(process.version, requiredVersion)) {
  error(
    `You are using Node ${process.version}, but @megalo/cli-service ` +
    `requires Node ${requiredVersion}.\nPlease upgrade your Node version.`
  )
  process.exit(1)
}

const webpack = require('webpack')
const romoveFile = require('rimraf')
const EnvPlugin = require('@megalo/env-plugin')
const { mergeUserConfig } = require('./mergeUserConfig')
const { resolve } = require('./util')
let webpackConfig

// 处理控制台参数，并在process.env中注入你.env文件配置的环境变量，可在后面的nodejs代码中直接使用环境变量
// 注意：实例创建后，这之后的webpack配置里可直接使用process.env.PLATFORM 和 process.env.NODE_ENV，所以它放在最前面执行(TODO: 解决耦合度过高)
const EnvPluginInstance = new EnvPlugin()
if (process.env.NODE_ENV === 'development') {
  webpackConfig = require('./webpack.dev.config')
} else {
  webpackConfig = require('./webpack.build.config')
}
// 全局替换项目中使用到的process.env.xxx
webpackConfig.plugins.unshift(EnvPluginInstance)
// 合并、并处理用户定义的webpack配置（megalo.config.js）
webpackConfig = mergeUserConfig(webpackConfig)

romoveFile(resolve(`dist-${process.env.PLATFORM}/*`), error => {
  if (error) throw error
  webpack(webpackConfig, () => { })
})

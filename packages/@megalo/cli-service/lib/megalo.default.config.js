/**
 * 处理用户定义的megalo.config.js，将其合并导出成default.js
 */

const merge = require('lodash/merge')
const { contextDir, checkFileExistsSync } = require('./util')

const defaultConfig = {
  build: {
    // 生成分析报告
    bundleAnalyzerReport: false,
    // 生成sourceMap
    sourceMap: false
  },
  configureWebpack: undefined,
  // 小程序原生组件存放目录（如果你有多个平台的原生组件，你应当在此目录下再新建几个子文件夹，我们约定，子文件夹名和平台的名字一致）
  // 微信小程序组件则命名为 'wechat'，支付宝为'alipay', 百度为 'swan'
  // 如果只有一个平台，则无需再新建子文件夹
  nativeDir: '/src/native',
  css: {
    loaderOptions: {
      css: {},
      sass: {},
      less: {},
      stylus: {},
      px2rpx: {
        rpxUnit: 0.5,
        rpxPrecision: 6
      }
    }
  }
}

const userConfigPath = contextDir + '/megalo.config.js'
if (checkFileExistsSync(userConfigPath)) {
  const userConfig = require(userConfigPath)
  merge(defaultConfig, userConfig)
}

module.exports = defaultConfig

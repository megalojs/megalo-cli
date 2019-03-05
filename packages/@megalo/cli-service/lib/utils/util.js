const path = require('path')
const fs = require('fs')
const merge = require('deepmerge')

/** 上下文目录（项目根目录的绝对路径） */
const contextDir = path.resolve(process.env.MEGALO_CLI_CONTEXT, '.')

exports.resolve = function resolve (...args) {
  return path.resolve(contextDir, ...args)
}

exports.getCssExt = (platform = 'wechat') => {
  return {
    wechat: 'wxss',
    alipay: 'acss',
    swan: 'css',
    tt: 'ttss'
  }[platform]
}

/**
 * 检查路径是否存在,存在则返回该路径，不存在则返回false
 * @param {String} fileOrDirPath 相对于项目根目录的路径
 * @returns {String | Boolean} 返回绝对路径或者false
 */
exports.checkFileExistsSync = fileOrDirPath => {
  fileOrDirPath = fileOrDirPath.includes(contextDir) ? fileOrDirPath : path.join(contextDir, fileOrDirPath)
  return fs.existsSync(fileOrDirPath) ? fileOrDirPath : false
}

const Config = require('webpack-chain')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const neededLoader = new Map([
  ['css', /\.css$/],
  ['less', /\.less$/],
  ['sass', /\.scss$/],
  ['stylus', /\.styl(us)?$/]
])

/**
 * 生成css相关的 Loader
 * @param {Object} projectOptions 项目配置
 */
exports.generateCssLoaders = (projectOptions) => {
  const config = new Config()
  for (const [loaderName, loaderReg] of neededLoader) {
    config.module
      .rule(loaderName)
        .test(loaderReg)
        .use('MiniCssExtractPlugin')
          .loader(MiniCssExtractPlugin.loader)
        .end()
        .use('css')
          .loader('css-loader')
          .when(projectOptions.css.loaderOptions['css'], config => {
            config.tap(options => merge(options, projectOptions.css.loaderOptions['css']))
          })
        .end()
        .use('px2rpx')
          .loader('px2rpx-loader')
          .options({
            rpxUnit: 0.5,
            rpxPrecision: 6
          })
          .when(projectOptions.css.loaderOptions['px2rpx'], config => {
            config.tap(options => merge(options, projectOptions.css.loaderOptions['px2rpx']))
          })
        .end()
        .when(loaderName !== 'css', config => {
          config.use(loaderName)
            .loader(`${loaderName}-loader`)
            .when(projectOptions.css.loaderOptions[loaderName], config => {
              config.tap(options => merge(options, projectOptions.css.loaderOptions[loaderName]))
            })
          .end()
        })
  }
  // return config.toString()
  // return config.toConfig()
  return config.module.toConfig().rules
}

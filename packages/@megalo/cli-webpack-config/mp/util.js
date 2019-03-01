const path = require('path')
const fs = require('fs')

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


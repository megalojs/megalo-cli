const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const padStart = require('string.prototype.padstart')

/** 上下文目录（项目根目录的绝对路径） */
const contextDir = path.resolve(process.cwd(), '.')
function resolve (...args) {
  return path.resolve(contextDir, ...args)
}

exports.contextDir = contextDir
exports.resolve = resolve

// 格式化输出
const format = (label, msg) => {
  return msg.split('\n').map((line, i) => {
    return i === 0
      ? `${label} ${line}`
      : padStart(line, chalk.reset(label).length)
  }).join('\n')
}

const chalkTag = msg => chalk.bgBlackBright.white.dim(` ${msg} `)

exports.error = (msg, tag = null) => {
  console.error(format(chalk.bgRed(' ERROR ') + (tag ? chalkTag(tag) : ''), chalk.red(msg)))
  if (msg instanceof Error) {
    console.error(msg.stack)
  }
}

exports.info = (msg, tag = null) => {
  console.log(format(chalk.bgBlue.black(' INFO ') + (tag ? chalkTag(tag) : ''), msg))
}

exports.getCssExt = (platform = 'wechat') => {
  return {
    wechat: 'wxss',
    alipay: 'acss',
    swan: 'css'
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


const fs = require('fs')
const path = require('path')
const contextDir = path.resolve(process.env.MEGALO_CLI_CONTEXT, '.')

exports.toPlugin = id => ({ id, apply: require(id) })

// Based on https://stackoverflow.com/questions/27367261/check-if-file-exists-case-sensitive
// Case checking is required, to avoid errors raised by case-sensitive-paths-webpack-plugin
function fileExistsWithCaseSync (filepath) {
  const { base, dir, root } = path.parse(filepath)

  if (dir === root || dir === '.') {
    return true
  }

  try {
    const filenames = fs.readdirSync(dir)
    if (!filenames.includes(base)) {
      return false
    }
  } catch (e) {
    // dir does not exist
    return false
  }

  return fileExistsWithCaseSync(dir)
}

exports.findExisting = (context, files) => {
  for (const file of files) {
    if (fileExistsWithCaseSync(path.join(context, file))) {
      return file
    }
  }
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

// 检查nodeJs版本
const semver = require('semver')
const { error } = require('@vue/cli-shared-utils')
const requiredVersion = require('../../package.json').engines.node
if (!semver.satisfies(process.version, requiredVersion)) {
  error(
    `You are using Node ${process.version}, but @megalo/cli-service ` +
    `requires Node ${requiredVersion}.\nPlease upgrade your Node version.`
  )
  process.exit(1)
}

if (require('@megalo/template-compiler/package.json').version !== require('megalo/package.json').version) {
  error(
    `Version numbers of "@megalo/template-compiler" and "megalo" must be consistent`
  )
  process.exit(1)
}

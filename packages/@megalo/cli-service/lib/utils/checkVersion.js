// 检查nodeJs版本
const semver = require('semver')
const { error, warn } = require('@vue/cli-shared-utils')
const requiredVersion = require('../../package.json').engines.node
if (!semver.satisfies(process.version, requiredVersion)) {
  error(
    `You are using Node ${process.version}, but @megalo/cli-service ` +
    `requires Node ${requiredVersion}.\nPlease upgrade your Node version.`
  )
  process.exit(1)
}

// 检查@megalo相关依赖包(避免因为依赖导致的bug)
const targetPackageVersion = require('@megalo/target/package.json').version
if (semver.satisfies(targetPackageVersion, '> 0.5.7')) {
  warn(
    `"@megalo/target" 在 0.5.7 之后的版本存在一个影响开发体验的bug: "代码书写报错在编译阶段会不显示、或者编译百分比不到100%等
    在bug解决之前，建议您在开发阶段使用 0.5.7 的版本，发布编译时使用最新版本
    您可以点击这里随时关注bug修复情况: https://github.com/kaola-fed/megalo-aot/issues\n`
  )
}

if (require('@megalo/template-compiler/package.json').version !== require('megalo/package.json').version) {
  error(
    `Version numbers of "@megalo/template-compiler" and "megalo" must be consistent`
  )
  process.exit(1)
}

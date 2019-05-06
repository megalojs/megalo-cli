const path = require('path')
const hash = require('hash-sum')
const { matchesPluginId } = require('@megalo/cli-share-utils')

module.exports = class PluginAPI {
  /**
   * @param {string} id - 插件ID
   * @param {Service} service - 一个megalo-cli-service 实例.
   */
  constructor (id, service) {
    this.id = id
    this.service = service
  }

  /**
   * 当前工作目录
   */
  getCwd () {
    return this.service.context
  }

  /**
   * 根据相对路径获取绝对路径地址
   *
   * @param {string} _path - 相对于项目根目录的相对路径
   * @return {string} 绝对路径
   */
  resolve (_path) {
    return path.resolve(this.service.context, _path)
  }

  /**
   * 检查项目是否有给定的插件
   *
   * @param {string} id - 插件id, 会忽略掉 (@megalo/|megalo-|@scope/megalo)-cli-plugin- 这些前缀
   * @return {boolean}
   */
  hasPlugin (id) {
    if (id === 'router') id = 'vue-router'
    if (['vue-router', 'vuex'].includes(id)) {
      const pkg = this.service.pkg
      return ((pkg.dependencies && pkg.dependencies[id]) || (pkg.devDependencies && pkg.devDependencies[id]))
    }
    return this.service.plugins.some(p => matchesPluginId(id, p.id))
  }

  /**
   * 检查项目是否有给定的包名
   * @param {String} packageName
   * @return {boolean}
   */
  hasPackage (packageName) {
    const pkg = this.service.pkg
    return ((pkg.dependencies && pkg.dependencies[packageName]) || (pkg.devDependencies && pkg.devDependencies[packageName]))
  }

  /**
   * 注册一个命令，形式类似于  `megalo-cli-service [name]`.
   *
   * @param {string} name
   * @param {object} [opts]
   *   {
   *     description: string,
   *     usage: string,
   *     options: { [string]: string }
   *   }
   * @param {function} fn
   *   (args: { [string]: string }, rawArgs: string[]) => ?Promise
   */
  registerCommand (name, opts, fn) {
    if (typeof opts === 'function') {
      fn = opts
      opts = null
    }
    this.service.commands[name] = { fn, opts: opts || {}}
  }

  /**
   * 注册一个接收chainable webpack config 对象配置的函数
   * 此函数是惰性的, 在调用'resolveWebPackConfig'之前不会调用它
   *
   * @param {function} fn
   */
  chainWebpack (fn) {
    this.service.webpackChainFns.push(fn)
  }

  /**
   * Register
   * - a webpack configuration object that will be merged into the config
   * OR
   * - a function that will receive the raw webpack config.
   *   the function can either mutate the config directly or return an object
   *   that will be merged into the config.
   *
   * @param {object | function} fn
   */
  configureWebpack (fn) {
    this.service.webpackRawConfigFns.push(fn)
  }

  /**
   * 生成最终的webpack配置对象，这个对象将会被传递给webpack
   * 一个插件可以通过调用 api.resolveWebpackConfig() 取回解析好的 webpack 配置。每次调用都会新生成一个 webpack 配置用来在需要时进一步修改
   *
   * @param {ChainableWebpackConfig} [chainableConfig]
   * @return {object} Raw webpack config.
   */
  resolveWebpackConfig (chainableConfig) {
    return this.service.resolveWebpackConfig(chainableConfig)
  }

  /**
   * 一个插件可以通过调用 api.resolveChainableWebpackConfig() 获得一个新生成的链式配置,可以多次调用此函数
   * See https://github.com/mozilla-neutrino/webpack-chain
   *
   * @return {ChainableWebpackConfig}
   */
  resolveChainableWebpackConfig () {
    return this.service.resolveChainableWebpackConfig()
  }

  /**
   * 根据相关变量生成缓存标志
   */
  genCacheConfig (id, partialIdentifier, configFiles = []) {
    const fs = require('fs')
    const cacheDirectory = this.resolve(`node_modules/.cache/${id}`)

    // replace \r\n to \n generate consistent hash
    const fmtFunc = conf => {
      if (typeof conf === 'function') {
        return conf.toString().replace(/\r\n?/g, '\n')
      }
      return conf
    }

    const variables = {
      partialIdentifier,
      'cli-service': require('../package.json').version,
      'cache-loader': require('cache-loader/package.json').version,
      env: process.env.NODE_ENV,
      test: !!process.env.VUE_CLI_TEST,
      config: [
        fmtFunc(this.service.projectOptions.chainWebpack),
        fmtFunc(this.service.projectOptions.configureWebpack)
      ]
    }

    if (!Array.isArray(configFiles)) {
      configFiles = [configFiles]
    }
    configFiles = configFiles.concat([
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml'
    ])

    const readConfig = file => {
      const absolutePath = this.resolve(file)
      if (!fs.existsSync(absolutePath)) {
        return
      }

      if (absolutePath.endsWith('.js')) {
        // should evaluate config scripts to reflect environment variable changes
        try {
          return JSON.stringify(require(absolutePath))
        } catch (e) {
          return fs.readFileSync(absolutePath, 'utf-8')
        }
      } else {
        return fs.readFileSync(absolutePath, 'utf-8')
      }
    }
    for (const file of configFiles) {
      const content = readConfig(file)
      if (content) {
        variables.configFiles = content.replace(/\r\n?/g, '\n')
        break
      }
    }

    const cacheIdentifier = hash(variables)
    return { cacheDirectory, cacheIdentifier }
  }
}

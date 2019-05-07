const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const readPkg = require('read-pkg')
const merge = require('webpack-merge')
const debug = require('debug')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const defaultsDeep = require('lodash.defaultsdeep')
const Config = require('webpack-chain')
const { error, isPlugin, loadModule } = require('@megalo/cli-share-utils')
const { defaults, validate } = require('./options')
const PluginAPI = require('./PluginAPI')

module.exports = class Service {
  constructor (context) {
    process.env.MEGALO_CLI_CONTEXT = context

    /** 确保Service只被初始化一次 */
    this.initialized = false

    /** 程序执行的上下文目录，默认情况下是项目的根目录 */
    this.context = context

    /** 存放插件中注册的 chainWebpack 回调函数 */
    this.webpackChainFns = []

    /** 存放插件中注册的 configureWebpack 回调函数 */
    this.webpackRawConfigFns = []

    /** 存放插件中注册的命令、参数以及回调处理函数 */
    this.commands = {}

    /** 用户项目包含 package.json 的目录 */
    this.pkgContext = context

    /** 用户项目的 package.json 内容 */
    this.pkg = this.resolvePkg()

    /** 待调用的插件对象数组 */
    this.plugins = this.resolvePlugins()

    /** 解析每个命令使用的默认模式,插件以module.exports.defaultmodes的形式提供,这样我们就可以在实际不执行插件的情况下获取信息 */
    this.modes = this.plugins.reduce((modes, { apply: { defaultModes }}) => {
      return Object.assign(modes, defaultModes)
    }, {})

    // console.log('loading plugins:', this.plugins.map(pluginItem => pluginItem.id))
  }

  resolvePkg (context = this.context) {
    if (fs.existsSync(path.join(context, 'package.json'))) {
      const pkg = readPkg.sync({ cwd: context })
      return pkg
    } else {
      return {}
    }
  }

  resolvePlugins () {
    const idToPlugin = id => ({
      id: id.replace(/^.\//, 'built-in:'),
      apply: require(id)
    })

    let plugins
    // 读取service内置插件名单
    const builtInPlugins = [
      './commands/serve',
      './commands/build',
      './commands/help',
      './commands/inspect',
      './config/base',
      '@megalo/cli-plugin-mp'
    ].map(idToPlugin)
    // 读取用户package.json中devDependencies和dependencies依赖中的插件名单
    const projectPlugins = Object.keys(this.pkg.devDependencies || {})
      .concat(Object.keys(this.pkg.dependencies || {}))
      .filter(isPlugin)
      .map(id => idToPlugin(id))
    plugins = builtInPlugins.concat(projectPlugins)

    // 项目本地的插件
    if (this.pkg.megaloPlugins && this.pkg.megaloPlugins.service) {
      const files = this.pkg.megaloPlugins.service
      if (!Array.isArray(files)) {
        throw new Error(`Invalid type for option 'megaloPlugins.service', expected 'array' but got ${typeof files}.`)
      }
      plugins = plugins.concat(files.map(file => ({
        id: `local:${file}`,
        apply: loadModule(file, this.pkgContext)
      })))
    }

    return plugins
  }

  /**
   * 加载用户配置的环境变量 (根目录下的.env 文件)
   * @param {String} mode 模式名
   * @description 同名环境变量优先级： .env.模式名.local > .env.模式名 > .env.local > .env
   */
  loadEnv (mode) {
    const logger = debug('megalo:env')
    const basePath = path.resolve(this.context, `.env${mode ? `.${mode}` : ``}`)
    const localPath = `${basePath}.local`

    const load = path => {
      try {
        const res = dotenv.config({ path, debug: process.env.DEBUG })
        dotenvExpand(res)
        logger(path, res)
      } catch (err) {
        // only ignore error if file is not found
        if (err.toString().indexOf('ENOENT') < 0) {
          error(err)
        }
      }
    }

    load(localPath)
    load(basePath)

    // by default, NODE_ENV and BABEL_ENV are set to "development" unless mode
    // is production or test. However the value in .env files will take higher
    // priority.
    if (mode) {
      // always set NODE_ENV during tests
      // as that is necessary for tests to not be affected by each other
      const shouldForceDefaultEnv = (
        process.env.VUE_CLI_TEST &&
        !process.env.VUE_CLI_TEST_TESTING_ENV
      )
      const defaultNodeEnv = (mode === 'production' || mode === 'test')
        ? mode
        : 'development'
      if (shouldForceDefaultEnv || process.env.NODE_ENV == null) {
        process.env.NODE_ENV = defaultNodeEnv
      }
      if (shouldForceDefaultEnv || process.env.BABEL_ENV == null) {
        process.env.BABEL_ENV = defaultNodeEnv
      }
    }
  }

  /**
   * 加载用户配置 (根目录下的 megalo.config.js 文件)
   * @return {Object} userOptions
   */
  loadUserOptions () {
    let fileConfig
    const configPath = path.resolve(this.context, 'megalo.config.js')
    if (fs.existsSync(configPath)) {
      try {
        fileConfig = require(configPath)

        if (typeof fileConfig === 'function') {
          fileConfig = fileConfig()
        }

        if (!fileConfig || typeof fileConfig !== 'object') {
          error(`Error loading ${chalk.bold('megalo.config.js')}: should export an object or a function that returns object.`)
          fileConfig = null
        }
      } catch (e) {
        error(`Error loading ${chalk.bold('megalo.config.js')}:`)
        throw e
      }
    }

    // 校验选项
    validate(fileConfig, msg => {
      error(
        `Invalid options in ${chalk.bold('megalo.config.js')}: ${msg}`
      )
    })

    return fileConfig
  }

  init (mode) {
    if (this.initialized) {
      return
    }
    this.initialized = true
    this.mode = mode
    // load mode .env
    if (mode) {
      this.loadEnv(mode)
    }
    // load base .env
    this.loadEnv()

    // load user config
    const userOptions = this.loadUserOptions()
    this.projectOptions = defaultsDeep(userOptions, defaults())

    debug('megalo:project-config')(this.projectOptions)

    // 挂载插件
    this.plugins.forEach(({ id, apply }) => {
      apply(new PluginAPI(id, this), this.projectOptions)
    })

    // 从项目配置文件里挂载 webpack configs
    if (this.projectOptions.chainWebpack) {
      this.webpackChainFns.push(this.projectOptions.chainWebpack)
    }
    if (this.projectOptions.configureWebpack) {
      this.webpackRawConfigFns.push(this.projectOptions.configureWebpack)
    }
  }

  async run (name, args = {}, rawArgv = []) {
    const mode = args.mode || (name === 'build' && args.watch ? 'development' : this.modes[name])
    process.env.PLATFORM = args.platform || 'wechat'
    args.platform = process.env.PLATFORM

    // 载入环境变量、用户配置(megalo.config.js)、挂载插件
    this.init(mode)

    // 将用户输入的命令和插件注册命令匹配，如果存在则执行相应的回调函数
    args._ = args._ || []
    let command = this.commands[name]
    if (!command && name) {
      error(`command "${name}" does not exist.`)
      process.exit(1)
    }
    if (!command || args.help || args.h) {
      command = this.commands.help
    } else {
      args._.shift() // remove command itself
      rawArgv.shift()
    }
    const { fn } = command
    return fn(args, rawArgv)
  }

  resolveChainableWebpackConfig () {
    const chainableConfig = new Config()
    // 执行插件中定义的 chainWebpack 回调函数，生成 webpack-chain 对象
    this.webpackChainFns.forEach(fn => fn(chainableConfig))
    return chainableConfig
  }

  /**
   * 生成最终的webpack配置，此函数将被 PluginAPI.js 中的 resolveWebpackConfig 调用
   */
  resolveWebpackConfig (chainableConfig = this.resolveChainableWebpackConfig()) {
    if (!this.initialized) {
      throw new Error('Service must call init() before calling resolveWebpackConfig().')
    }
    // get raw config
    let config = chainableConfig.toConfig()
    const original = config

    // 执行插件中定义的 configureWebpack 回调函数，生成原始的 webpack 配置对象
    this.webpackRawConfigFns.forEach(fn => {
      if (typeof fn === 'function') {
        // function with optional return value
        const res = fn(config)
        if (res && res !== original) config = merge(config, res)
      } else if (fn) {
        // merge literal values
        config = merge(config, fn)
      }
    })

    // #2206 If config is merged by merge-webpack, it discards the __ruleNames
    // information injected by webpack-chain. Restore the info so that
    // vue inspect works properly.
    if (config !== original) {
      cloneRuleNames(
        config.module && config.module.rules,
        original.module && original.module.rules
      )
    }

    return config
  }
}

function cloneRuleNames (to, from) {
  if (!to || !from) {
    return
  }
  from.forEach((r, i) => {
    if (to[i]) {
      Object.defineProperty(to[i], '__ruleNames', {
        value: r.__ruleNames
      })
      cloneRuleNames(to[i].oneOf, r.oneOf)
    }
  })
}

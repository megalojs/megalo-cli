const debug = require('debug')
const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const { error } = require('@vue/cli-shared-utils')
const defaultsDeep = require('lodash.defaultsdeep')
const { defaults, validate } = require('./options')

module.exports = class Server {
  constructor (context) {
    this.initialized = false
    this.context = context
    this.projectOptions = {}
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
  }

  /**
   * 载入用户配置的环境变量 (根目录下的.env 文件)
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
   * 载入用户配置 (根目录下的 megalo.config.js 文件)
   * @return {Object} userOptions
   */
  loadUserOptions () {
    let fileConfig
    const configPath = path.resolve(this.context, 'megalo.config.js')
    if (fs.existsSync(configPath)) {
      try {
        fileConfig = require(configPath)
        if (!fileConfig || typeof fileConfig !== 'object') {
          error(`Error loading ${chalk.bold('megalo.config.js')}: should export an object.`)
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

  async run (commandName = 'serve', commandOptions = { mode: 'development', platform: 'wechat', report: false, fix: false, debug: false }) {
    if (commandOptions.debug) {
      process.env.DEBUG = true
    }

    // 载入用户自定义的环境变量、用户配置
    this.init(commandOptions.mode)

    ;(commandOptions.platform === 'h5' ? require('h5') : require('./mp'))(commandName, commandOptions, this.projectOptions)
  }
}

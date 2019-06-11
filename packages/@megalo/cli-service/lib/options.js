const { createSchema, validate } = require('@megalo/cli-share-utils')

const schema = createSchema(joi => joi.object({
  // 入口文件
  appEntry: joi.object({
    jsEntry: joi.string().allow(''),
    vueEntry: joi.string().allow('')
  }),

  // 小程序原生组件存放目录（如果你有多个平台的原生组件，你应当在此目录下再新建几个子文件夹，我们约定，子文件夹名和平台的名字一致）
  // 微信小程序组件则命名为 'wechat'，支付宝为'alipay', 百度为 'swan'
  // 如果只有一个平台，则无需再新建子文件夹
  nativeDir: joi.string().allow(''),

  // 生产构建时生成source map
  productionSourceMap: joi.boolean(),

  // 是否在开发环境下通过 eslint-loader 在每次保存时 lint 代码
  lintOnSave: joi.any().valid([true, false, 'error']),

  // css
  css: joi.object({
    modules: joi.boolean(),
    sourceMap: joi.boolean(),
    loaderOptions: joi.object({
      css: joi.object(),
      sass: joi.object(),
      less: joi.object(),
      stylus: joi.object(),
      postcss: joi.object(),
      px2rpx: joi.alternatives().try(
        joi.object(),
        joi.any().valid([false])
      )
    })
  }),

  // webpack
  chainWebpack: joi.func(),
  configureWebpack: joi.alternatives().try(
    joi.object(),
    joi.func()
  ),

  devServer: joi.object(),

  // 第三方插件自定义选项
  pluginOptions: joi.object()
}))

exports.validate = (options, cb) => {
  validate(options, schema, cb)
}

exports.defaults = () => ({
  appEntry: {
    jsEntry: '',
    vueEntry: ''
  },

  nativeDir: '/src/native',

  productionSourceMap: false,

  lintOnSave: true,

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
  },

  devServer: {
  /*
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 8080,
    https: false,
    hotOnly: false,
    proxy: null, // string | Object
    before: app => {}
  */
  }

})

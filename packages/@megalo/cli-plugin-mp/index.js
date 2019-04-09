module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    if (!['web', 'h5'].includes(process.env.PLATFORM)) {
      console.log('生成小程序相关webpack配置', process.env.NODE_ENV)
    }
  })
}

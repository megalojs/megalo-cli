module.exports = {
  nativeDir: '',
  chainWebpack: config => {
    config.devtool('cheap-source-map')
    console.log('chainWebpack执行了111')
  },
  configureWebpack: config => {
    console.log('configureWebpack执行了222')
  }
}

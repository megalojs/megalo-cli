
module.exports = (api, options) => {
  api.chainWebpack(chainConfig => {
    if (!['web', 'h5'].includes(process.env.PLATFORM)) {
      // 编译小程序平台的时候替换包
      chainConfig.resolve.alias.set('regenerator-runtime', '@megalo/fock-regenerator-runtime')
    }
  })
}

/**
 * 根据平台获取css文件后缀扩展
 */
exports.getCssExt = function (platform) {
  return {
    wechat: 'wxss',
    alipay: 'acss',
    swan: 'css',
    toutiao: 'ttss',
    web: 'css'
  }[platform]
}

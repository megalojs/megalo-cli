
const { info, log } = require('@megalo/cli-share-utils')

module.exports = (api, options) => {
  api.registerCommand('serve', {
    description: 'start development server',
    usage: 'megalo-cli-service serve [options] [entry]',
    options: {
      '--platform': `set target platform, one of wechat、alipay、swan、toutiao、web (default: wechat)`,
      '--mode': `specify env mode (default: development)`,
      '--copy': `copy url to clipboard on server start, effective only when platform = web`,
      '--host': `specify host, effective only when platform = web (default: '0.0.0.0')`,
      '--port': `specify port, effective only when platform = web (default: 8080)`,
      '--https': `use https, effective only when platform = web (default: false)`,
      '--public': `specify the public network URL for the HMR client, effective only when platform = web`
    }
  }, async function serve (args) {
    log()
    info('Starting development server...')
    log()
    ;(['web', 'h5'].includes(args.platform) ? require('./webDevServer') : require('./mpDevServer'))(api, options, args)
  })
}

module.exports.defaultModes = {
  serve: 'development'
}

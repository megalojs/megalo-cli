const path = require('path')

module.exports = (api, options) => {
  const fs = require('fs')
  const useThreads = process.env.NODE_ENV === 'production' && options.parallel

  api.chainWebpack(config => {
    config.resolveLoader.modules.prepend(path.join(__dirname, 'node_modules'))

    config.resolve
      .extensions
        .merge(['.ts'])

    const tsRule = config.module.rule('ts').test(/\.ts$/)

    // add a loader to both *.ts & vue<lang="ts">
    const addLoader = ({ loader, options }) => {
      tsRule.use(loader).loader(loader).options(options)
    }

    if (useThreads) {
      addLoader({
        loader: 'thread-loader'
      })
    }

    addLoader({
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
        appendTsSuffixTo: ['\\.vue$'],
        // https://github.com/TypeStrong/ts-loader#happypackmode-boolean-defaultfalse
        happyPackMode: useThreads
      }
    })

    // this plugin does not play well with jest + cypress setup (tsPluginE2e.spec.js) somehow
    // so temporarily disabled for vue-cli tests
    config
      .plugin('fork-ts-checker')
        .use(require('fork-ts-checker-webpack-plugin'), [{
          vue: true,
          tslint: options.lintOnSave !== false && fs.existsSync(api.resolve('tslint.json')),
          formatter: 'codeframe',
          // https://github.com/TypeStrong/ts-loader#happypackmode-boolean-defaultfalse
          checkSyntacticErrors: useThreads
        }])
  })

  if (!api.hasPlugin('eslint')) {
    api.registerCommand('lint', {
      description: 'lint source files with TSLint',
      usage: 'megalo-cli-service lint [options] [...files]',
      options: {
        '--format [formatter]': 'specify formatter (default: codeFrame)',
        '--no-fix': 'do not fix errors',
        '--formatters-dir [dir]': 'formatter directory',
        '--rules-dir [dir]': 'rules directory'
      }
    }, args => {
      return require('./tslint')(args, api)
    })
  }
}

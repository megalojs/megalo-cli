const path = require('path')

module.exports = (api, options) => {
  const fs = require('fs')

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

    addLoader({
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
        appendTsSuffixTo: ['\\.vue$']
      }
    })

    const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
    config
      .plugin('fork-ts-checker')
        .use(ForkTsCheckerWebpackPlugin, [{
          vue: true,
          tslint: options.lintOnSave !== false && fs.existsSync(api.resolve('tslint.json')),
          formatter: 'codeframe',
          workers: ForkTsCheckerWebpackPlugin.TWO_CPUS_FREE
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

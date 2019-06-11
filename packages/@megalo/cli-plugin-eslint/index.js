const path = require('path')

module.exports = (api, options) => {
  if (options.lintOnSave) {
    const extensions = require('./eslintOptions').extensions(api)
    // 优先使用用户自己安装的 eslint 版本
    const { resolveModule, loadModule } = require('@megalo/cli-share-utils')
    const cwd = api.getCwd()
    const eslintPkg =
      loadModule('eslint/package.json', cwd, true) ||
      require('eslint/package.json')

    // 当 eslint 配置文件修改时，eslint-loader 处理的其实还是缓存的代码（若开启了缓存的话）
    // 所以必须手动生成一个缓存标志符来规避这个问题，这里使用包和用户对包的配置内容作为变量来生成标志符
    const { cacheIdentifier } = api.genCacheConfig(
      'eslint-loader',
      {
        'eslint-loader': require('eslint-loader/package.json').version,
        eslint: eslintPkg.version
      },
      [
        '.eslintrc.js',
        '.eslintrc.yaml',
        '.eslintrc.yml',
        '.eslintrc.json',
        '.eslintrc',
        'package.json'
      ]
    )

    api.chainWebpack(webpackConfig => {
      webpackConfig.resolveLoader.modules.prepend(
        path.join(__dirname, 'node_modules')
      )

      const { lintOnSave } = options
      const allWarnings = lintOnSave === true || lintOnSave === 'warning'
      const allErrors = lintOnSave === 'error'

      webpackConfig.module
        .rule('eslint')
          .pre()
          .exclude
            .add(/node_modules/)
            .add(require('path').dirname(require.resolve('@megalo/cli-service')))
            .end()
          .test(/\.(vue|(j|t)sx?)$/)
          .use('eslint-loader')
            .loader('eslint-loader')
            .options({
              extensions,
              cache: true,
              cacheIdentifier,
              emitWarning: allWarnings,
              // only emit errors in production mode.
              emitError: allErrors,
              eslintPath: resolveModule('eslint', cwd) || require.resolve('eslint'),
              formatter:
                loadModule('eslint/lib/formatters/codeframe', cwd, true) ||
                require('eslint/lib/formatters/codeframe')
            })
    })
  }

  api.registerCommand(
    'lint',
    {
      description: 'lint and fix source files',
      usage: 'megalo-cli-service lint [options] [...files]',
      options: {
        '--format [formatter]': 'specify formatter (default: codeframe)',
        '--no-fix': 'do not fix errors or warnings',
        '--no-fix-warnings': 'fix errors, but do not fix warnings',
        '--max-errors [limit]':
          'specify number of errors to make build failed (default: 0)',
        '--max-warnings [limit]':
          'specify number of warnings to make build failed (default: Infinity)'
      },
      details:
        'For more options, see https://eslint.org/docs/user-guide/command-line-interface#options'
    },
    args => {
      require('./lint')(args, api)
    }
  )
}

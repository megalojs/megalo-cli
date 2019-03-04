const webpack = require('webpack')
const path = require('path')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const createMegaloTarget = require('@megalo/target')
const compiler = require('@megalo/template-compiler')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { resolveModule, loadModule } = require('@vue/cli-shared-utils')
const { pagesEntry } = require('@megalo/entry')
const { getCssExt, checkFileExistsSync, resolve } = require('../../utils/util')
const resolveClientEnv = require('../../utils/resolveClientEnv')
const appMainFile = resolve('src/index.js')
const cwd = process.env.MEGALO_CLI_CONTEXT || process.cwd()

module.exports = function createBaseConfig (commandName, commandOptions, projectOptions) {
  const platform = commandOptions.platform
  const isDEV = process.env.NODE_ENV === 'development'
  const cssExt = getCssExt(platform)

  const cssLoaders = [
    MiniCssExtractPlugin.loader,
    'css-loader',
    {
      loader: 'px2rpx-loader',
      options: {
        rpxUnit: 0.5,
        rpxPrecision: 6
      }
    }
  ]
  const config = {
    mode: 'none',

    target: createMegaloTarget({
      compiler: Object.assign(compiler, {}),
      platform,
      htmlParse: {
        templateName: 'octoParse',
        src: resolve(`node_modules/octoparse/lib/platform/${platform}`)
      }
    }),

    entry: {
      'app': appMainFile,
      ...pagesEntry(appMainFile)
    },

    output: {
      path: resolve(`dist-${platform}/`),
      filename: 'static/js/[name].js',
      chunkFilename: 'static/js/[name].js',
      pathinfo: false
    },

    optimization: {
      noEmitOnErrors: true,
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]|megalo[\\/]/,
            name: 'vendor',
            chunks: 'initial'
          },
          common: {
            name: 'common',
            minChunks: 2
          }
        }
      },
      runtimeChunk: {
        name: 'runtime'
      }
    },

    resolve: {
      extensions: ['.vue', '.js', '.json'],
      alias: {
        'vue': 'megalo',
        '@': resolve('src')
      }
    },

    module: {
      noParse: /^(vue|vuex)$/,
      rules: [
        {
          test: /\.vue$/,
          use: [
            {
              loader: 'vue-loader',
              options: {
                compilerOptions: {
                  preserveWhitespace: false
                }
              }
            }
          ]
        },
        {
          test: /\.js$/,
          use: 'babel-loader'
        },
        {
          test: /\.css$/,
          use: cssLoaders
        },
        {
          test: /\.less$/,
          use: [
            ...cssLoaders,
            'less-loader'
          ]
        },
        {
          test: /\.styl(us)?$/,
          use: [
            ...cssLoaders,
            'stylus-loader'
          ]
        },
        {
          test: /\.scss$/,
          use: [
            ...cssLoaders,
            'sass-loader'
          ]
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192,
                // TODO 这里有个小bug, static的图片会生成在dist下面的src目录，子包的图片会生成在子包下的src目录，不影响分包策略，仅仅是路径看着有些别扭
                name: '[path][name].[ext]'
              }
            }
          ]
        }
      ]
    },

    plugins: [
      new VueLoaderPlugin(),
      new webpack.DefinePlugin(resolveClientEnv()),
      new MiniCssExtractPlugin({
        filename: `static/css/[name].${cssExt}`
      }),
      new webpack.ProgressPlugin(),
      new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your miniprogram application has been compiled successfully`],
          notes: isDEV ? [] : [`The compiled files are in directory dist-${platform}  (*^▽^*) Enjoy it~`]
        },
        onErrors: function (severity, errors) {
          if (severity !== 'error') {
            return
          }
          console.log('(⊙﹏⊙) \n', errors[0].webpackError)
        },
        clearConsole: true,
        additionalFormatters: [],
        additionalTransformers: []
      })
    ]
  }

  // 启用 @Megalo/API
  const megaloAPIPath = checkFileExistsSync(`node_modules/@megalo/api/platforms/${platform}`)
  if (megaloAPIPath) {
    config.plugins.push(new webpack.ProvidePlugin({
      'Megalo': [megaloAPIPath, 'default']
    }))
  }

  // 拷贝原生小程序组件 TODO： 拷贝前可对其进行预处理（babel转译\混淆\压缩等）
  const nativeDir = checkFileExistsSync(path.join(projectOptions.nativeDir, platform)) || checkFileExistsSync(projectOptions.nativeDir)
  if (nativeDir) {
    config.plugins.push(new CopyWebpackPlugin([
      {
        context: nativeDir,
        from: `**/*`,
        to: resolve(`dist-${platform}/native`)
      }
    ]))
  }

  if (projectOptions.lintOnSave) {
    config.module.rules.push({
      enforce: 'pre',
      test: /\.(vue|(j|t)sx?)$/,
      exclude: [/node_modules/],
      use: [
        {
          loader: 'eslint-loader',
          options: {
            // TODO 支持typescript
            extensions: [
              '.js',
              '.jsx',
              '.vue'
            ],
            cache: true,
            emitWarning: projectOptions.lintOnSave !== 'error',
            emitError: projectOptions.lintOnSave === 'error',
            eslintPath: resolveModule('eslint', cwd) || require.resolve('eslint'),
            formatter: loadModule('eslint/lib/formatters/codeframe', cwd, true) || require('eslint/lib/formatters/codeframe')
          }
        }
      ]
    })
  }
  return config
}

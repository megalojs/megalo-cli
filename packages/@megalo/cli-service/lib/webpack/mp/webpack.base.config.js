const webpack = require('webpack')
const ChainableWebpackConfig = require('webpack-chain')
const path = require('path')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const { resolveModule, loadModule } = require('@vue/cli-shared-utils')
const createMegaloTarget = require('@megalo/target')
const compiler = require('@megalo/template-compiler')
const { pagesEntry } = require('@megalo/entry')
const { getCssExt, generateCssLoaders, checkFileExistsSync, resolve } = require('../../utils/util')
const resolveClientEnv = require('../../utils/resolveClientEnv')
const appMainFile = resolve('src/index.js')

module.exports = function createBaseConfig (commandName, commandOptions, projectOptions) {
  const cwd = process.env.MEGALO_CLI_CONTEXT || process.cwd()
  const platform = commandOptions.platform
  const isProd = process.env.NODE_ENV === 'production'
  const cssExt = getCssExt(platform)
  const chainaConfig = new ChainableWebpackConfig()

  chainaConfig
    .mode(isProd ? 'production' : 'development')
    .devtool(isProd && !projectOptions.productionSourceMap ? 'none' : 'cheap-source-map')
    .target(
      createMegaloTarget({
        compiler: Object.assign(compiler, {}),
        platform,
        htmlParse: {
          templateName: 'octoParse',
          src: resolve(`node_modules/octoparse/lib/platform/${platform}`)
        }
      })
    )
    .output
      .path(resolve(`dist-${platform}/`))
      .filename('static/js/[name].js')
      .chunkFilename('static/js/[name].js')
      .pathinfo(false)
      .end()
    .optimization
      .noEmitOnErrors(true)
      .runtimeChunk({ name: 'runtime' })
      .splitChunks({
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
      })
      .when(isProd, optimization => {
        optimization
          .minimizer('optimize-js')
            .use(
              TerserPlugin,
              [{
                cache: true,
                parallel: true,
                sourceMap: projectOptions.productionSourceMap ? 'cheap-source-map' : false
              }]
            )
            .end()
          .minimizer('optimize-css')
            .use(
              OptimizeCSSAssetsPlugin,
              [{
                assetNameRegExp: new RegExp(`\\.${getCssExt(platform)}$`, 'g')
              }]
            )
      })
      .end()

  // 入口
  chainaConfig.entry('app').add(appMainFile)
  const pages = Object.entries(pagesEntry(appMainFile))
  for (const [key, value] of pages) {
    chainaConfig.entry(key).add(value)
  }

  chainaConfig.resolve.extensions
    .add('.vue')
    .add('.js')
    .add('.ts')
    .add('.json')

  chainaConfig.resolve.alias
    .set('vue', 'megalo')
    .set('@', resolve('src'))

  chainaConfig.module
    .noParse(/^(vue|vuex)$/)
    .rule('vue')
      .test(/\.vue$/)
      .use('vue')
        .loader('vue-loader')
        .options({
          compilerOptions: {
            preserveWhitespace: false
          }
        })
        .end()
      .end()

  chainaConfig.module
    .rule('js')
      .test(/(\.js|\.tsx?)$/)
      .use('babel')
        .loader('babel-loader')
        .end()
      .end()

    .rule('ts')
      .test(/\.tsx?$/)
      .use('ts')
        .loader('ts-loader')
        .options({
          appendTsSuffixTo: [/\.vue$/]
        })
        .end()
      .exclude
        .add(/node_modules/)
        .end()
      .end()

    .rule('picture')
      .test(/\.(png|jpe?g|gif)$/i)
      .use('url')
        .loader('url-loader')
        .options({
          limit: 8192,
          // TODO 这里有个小bug, static的图片会生成在dist下面的src目录，子包的图片会生成在子包下的src目录，不影响分包策略，仅仅是路径看着有些别扭
          name: '[path][name].[ext]'
        })
        .end()
      .end()
    .end()

  // 这里有个坑，css相关的loader必须放处理 ts 的 loader的后面，不然target那边会报错
  generateCssLoaders(chainaConfig, projectOptions)

  chainaConfig
    .plugin('vue-loader-plugin')
      .use(VueLoaderPlugin)
      .end()
    .plugin('env-replace-plugin')
      .use(webpack.DefinePlugin, [resolveClientEnv()])
      .end()
    .plugin('mini-css-extract-plugin')
      .use(MiniCssExtractPlugin, [{ filename: `static/css/[name].${cssExt}` }])
      .end()
    .plugin('process-plugin')
      .use(webpack.ProgressPlugin)
      .end()
    .plugin('friendly-error-plugin')
      .use(
        FriendlyErrorsPlugin,
        [{
          compilationSuccessInfo: {
            messages: [`Your miniprogram application has been compiled successfully`],
            notes: isProd ? [`The compiled files are in directory dist-${platform}  (*^▽^*) Enjoy it~`] : []
          },
          onErrors: function (severity, errors) {
            if (severity !== 'error') {
              return
            }
            console.log('哦哦(⊙﹏⊙)，出错料～ \n')
          },
          clearConsole: true,
          additionalFormatters: [],
          additionalTransformers: []
        }]
      )
      .end()

  // 启用 @Megalo/API
  const megaloAPIPath = checkFileExistsSync(`node_modules/@megalo/api/platforms/${platform}`)
  if (megaloAPIPath) {
    chainaConfig.plugin('provide-plugin')
      .use(webpack.ProvidePlugin, [{ 'Megalo': [megaloAPIPath, 'default'] }])
  }

  // 拷贝原生小程序组件 TODO： 拷贝前可对其进行预处理（babel转译\混淆\压缩等）
  const nativeDir = checkFileExistsSync(path.join(projectOptions.nativeDir, platform)) || checkFileExistsSync(projectOptions.nativeDir)
  if (nativeDir) {
    chainaConfig.plugin('copy-webpack-plugin')
      .use(
        CopyWebpackPlugin,
        [
          [
            {
              context: nativeDir,
              from: `**/*`,
              to: resolve(`dist-${platform}/native`)
            }
          ]
        ]
      )
  }

  chainaConfig.module
    .when(projectOptions.lintOnSave, module => {
      module.rule('eslint')
        .enforce('pre')
        .test(/\.(vue|(j|t)sx?)$/)
        .use('eslint')
          .loader('eslint-loader')
          .options({
            // TODO 支持typescript
            extensions: [
              '.js',
              '.jsx',
              '.vue'
            ],
            // TODO 缓存系统优化
            cache: false,
            emitWarning: projectOptions.lintOnSave !== 'error',
            emitError: projectOptions.lintOnSave === 'error',
            eslintPath: resolveModule('eslint', cwd) || require.resolve('eslint'),
            formatter: loadModule('eslint/lib/formatters/codeframe', cwd, true) || require('eslint/lib/formatters/codeframe')
          })
          .end()
        .exclude.add(/node_modules/)
    })

  return chainaConfig
}

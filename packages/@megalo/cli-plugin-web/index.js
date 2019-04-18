const fs = require('fs')
const chalk = require('chalk')
const path = require('path')
const { getCssExt } = require('@megalo/cli-share-utils')
const { findExisting, checkFileExistsSync } = require('./utils')

module.exports = (api, options) => {
  const platform = process.env.PLATFORM
  const cssExt = getCssExt(platform)
  const isProd = process.env.NODE_ENV === 'production'

  api.chainWebpack(chainConfig => {
    if (platform === 'web') {
      const webpack = require('webpack')
      const MiniCssExtractPlugin = require('mini-css-extract-plugin')
      const VueLoaderPlugin = require('vue-loader/lib/plugin')
      const TerserPlugin = require('terser-webpack-plugin')
      const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
      const CopyWebpackPlugin = require('copy-webpack-plugin')
      const HtmlWebpackPlugin = require('html-webpack-plugin')

      const target = createTarget()

      // 检查入口文件
      resolveEntry()

      // web使用生成的入口文件
      chainConfig.entry('index')
				.add(path.join(process.cwd(), './dist-web/webEntry.js'))

      chainConfig
        .devtool(isProd && !options.productionSourceMap ? 'none' : 'source-map')
        .target(target)
        .output
          .path(api.resolve(`dist-${platform}/`))
          .filename(isProd ? '[name].[contenthash].js' : '[name].js')
          .chunkFilename(isProd ? '[name].[id].[contenthash].js' : '[name].[id].js')

      // web dev环境添加dev-server
      !isProd && chainConfig
				.devServer
						.open(true)

      // 提取公共文件、压缩混淆
      chainConfig.optimization
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
                sourceMap: options.productionSourceMap
              }]
            )
            .end()
          .minimizer('optimize-css')
            .use(
              OptimizeCSSAssetsPlugin,
              [{
                assetNameRegExp: new RegExp(`\\.${getCssExt(platform)}$`, 'g'),
                cssProcessorPluginOptions: {
                  preset: ['default', {
                    discardComments: { removeAll: true },
                    calc: false
                  }]
                }
              }]
            )
      })

      // 处理.vue
      chainConfig.module
        .rule('vue')
          .test(/\.vue$/)
          .use('vue')
            .loader('vue-loader')
            .options({
              compilerOptions: {
                preserveWhitespace: false
              }
            })

      // babel
      chainConfig.module
        .rule('js')
          .test(/\.(ts|js)x?$/)
            .use('babel')
              .loader('babel-loader')

      // css相关loader
      generateCssLoaders(chainConfig)

      // 图片
      chainConfig.module
        .rule('picture')
        .test(/\.(png|jpe?g|gif)$/i)
        .use('url')
          .loader('url-loader')
          .options({
            limit: 8192,
            // TODO 这里有个小bug, static的图片会生成在dist下面的src目录，子包的图片会生成在子包下的src目录，不影响分包策略，仅仅是路径看着有些别扭
            name: '[path][name].[ext]'
          })

      // 插件
      chainConfig
        .plugin('process-plugin')
          .use(webpack.ProgressPlugin)
          .end()
        .plugin('vue-loader-plugin')
          .use(VueLoaderPlugin)
          .end()
        .plugin('mini-css-extract-plugin')
					.use(MiniCssExtractPlugin, [{ filename: `static/css/[name].${cssExt}` }])
					.end()
				.plugin('html-webpack-plugin')
          .use(HtmlWebpackPlugin, [{
            filename: 'index.html',
            template: 'src/web/index.html'
          }])
					.end()
				.plugin('copy-webpack-plugin')
          .use(CopyWebpackPlugin, [{
            from: 'src/static', to: 'static'
          }])

      chainConfig.stats({
        all: false,
        modules: false,
        maxModules: 0,
        errors: true,
        warnings: true,
        moduleTrace: false,
        errorDetails: true
      })

      // megalo 周边
      // 启用 @Megalo/API
      const megaloAPIPath = checkFileExistsSync(`node_modules/@megalo/api/platforms/${platform}`)
      if (megaloAPIPath) {
        chainConfig.plugin('provide-plugin')
          .use(webpack.ProvidePlugin, [{ 'Megalo': [megaloAPIPath, 'default'] }])
      }

      // 拷贝原生小程序组件 TODO： 拷贝前可对其进行预处理（babel转译\混淆\压缩等）
      const nativeDir = checkFileExistsSync(path.join(options.nativeDir, platform)) || checkFileExistsSync(options.nativeDir)
      if (nativeDir) {
        chainConfig.plugin('copy-webpack-plugin')
          .use(
            CopyWebpackPlugin,
            [
              [
                {
                  context: nativeDir,
                  from: `**/*`,
                  to: api.resolve(`dist-${platform}/native`)
                }
              ]
            ]
          )
      }
    }
  })

  function resolveEntry () {
    // app entry
    const entryContext = api.resolve('src')
    const appEntry = findExisting(entryContext, [
      'app.js',
      'App.vue'
    ])

    if (!appEntry) {
      console.log(chalk.red(`Failed to locate entry file in ${chalk.yellow(entryContext)}.`))
      console.log(chalk.red(`Valid entry file should be one of: app.js, App.vue.`))
      process.exit(1)
    }

    const appEntryPath = path.join(entryContext, appEntry)

    if (!fs.existsSync(appEntryPath)) {
      console.log(chalk.red(`Entry file ${chalk.yellow(appEntry)} does not exist.`))
      process.exit(1)
    }

    // 页面entry
    const { pagesEntry } = require('@megalo/entry')

    return { appEntry: appEntryPath, pagesEntry: pagesEntry(appEntryPath, options) }
  }

  function createTarget () {
    const createMegaloTarget = require('megalo-target-debug')
    const targetConfig = {
      platform,
      compiler: require('vue-template-compiler'),
      projectOptions: options
    }

    return createMegaloTarget(targetConfig)
  }

  /**
   * 生成css相关的 Loader
   *
   */
  function generateCssLoaders (chainConfig, projectOptions = options) {
    const MiniCssExtractPlugin = require('mini-css-extract-plugin')
    const merge = require('deepmerge')
    const neededLoader = new Map([
      ['css', /\.css$/],
      ['less', /\.less$/],
      ['sass', /\.scss$/],
      ['stylus', /\.styl(us)?$/]
    ])

    for (const [loaderName, loaderReg] of neededLoader) {
      chainConfig.module
        .rule(loaderName)
					.test(loaderReg)

						.use('MiniCssExtractPlugin')
							.loader(MiniCssExtractPlugin.loader)
						.end()

						.use('css')
							.loader('css-loader')
              .when(projectOptions.css.loaderOptions['css'], config => {
                config.tap(options => merge(options, projectOptions.css.loaderOptions['css']))
              })
						.end()

						.use('postcss')
							.loader('postcss-loader')
              .options({
                plugins: () => [
                  require('autoprefixer')(),
                  require('postcss-plugin-px2rem')({
                    rootValue: 75,
                    propBlackList: ['border']
                  })
                ]
              })
						.end()

            .when(loaderName !== 'css', config => {
              config.use(loaderName)
								.loader(`${loaderName}-loader`)
                .when(projectOptions.css.loaderOptions[loaderName], config => {
                  config.tap(options => merge(options, projectOptions.css.loaderOptions[loaderName]))
                })
							.end()
            })
    }
    return chainConfig.module.toConfig().rules
  }
}

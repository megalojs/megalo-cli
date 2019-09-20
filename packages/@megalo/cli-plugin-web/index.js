const fs = require('fs')
const chalk = require('chalk')
const path = require('path')
const { getCssExt } = require('@megalo/cli-share-utils')
const { findExisting, checkFileExistsSync } = require('./utils')
const generateEntryFiles = require( './generateEntryFiles' )

module.exports = (api, options) => {
  const platform = process.env.PLATFORM
  const cssExt = getCssExt(platform)
  const isProd = process.env.NODE_ENV === 'production'
  const isTypescript = api.hasPlugin('typescript')
  const jsExt = ['js', 'ts'][+isTypescript]
  const entryContext = api.resolve('src')
  const entryContextRelativePath = path.relative(api.getCwd(), entryContext)

  api.chainWebpack(chainConfig => {
    if (['web', 'h5'].includes(platform)) {
      const webpack = require('webpack')
      const MiniCssExtractPlugin = require('mini-css-extract-plugin')
      const VueLoaderPlugin = require('vue-loader/lib/plugin')
      const TerserPlugin = require('terser-webpack-plugin')
      const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
      const HtmlWebpackPlugin = require('html-webpack-plugin')

      // 输出目录
      const output = api.resolve(`dist-${platform}/`)
      // 获取所有页面 及 子package的入口
      const { pagesEntry, subPackagesRoot } = resolveEntry()

      // 生成转h5用到的入口临时文件
      generateEntryFiles(pagesEntry);

      if (options.isSpa) {
        // 入口配置
        chainConfig.entry('index')
          .add(api.resolve('.megalo-h5-tmp/entry.js'))
        
        chainConfig
          .devtool(isProd && !options.productionSourceMap ? 'none' : 'source-map')
          .target('web')
          .output
            .path(output)
            .filename(isProd ? '[name].[contenthash].js' : '[name].js')
            .chunkFilename(isProd ? '[name].[id].[contenthash].js' : '[name].[id].js')

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

        // html出口文件配置
        chainConfig.plugin('html-webpack-plugin')
        .use(HtmlWebpackPlugin, [{
          filename: 'index.html',
          template: '.megalo-h5-tmp/index.html'
        }])
        .end()
      } else {
        const pages = Object.entries(pagesEntry)
        // 入口配置
        for (const [key, value] of pages) {
          chainConfig.entry(key).add(value)
        }
        chainConfig
        .devtool(isProd && !options.productionSourceMap ? 'none' : 'source-map')
        .target('web')
        .output
          .path(output)
          .filename('[name].js')
          .chunkFilename('[name].js')
          .pathinfo(false)

        // html出口文件配置
        for (const [key, value] of pages) {
          chainConfig.plugin(`html-webpack-plugin-${key}`)
          .use(HtmlWebpackPlugin, [{
            filename: `${key}.html`,
            template: '.megalo-h5-tmp/index.html',
            chunks: [`${key}`],
          }])
          .end()
        }
      }

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
        .test(/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/)
        .use('url-loader')
          .loader('url-loader')
          .options(genUrlLoaderOptions('images', subPackagesRoot))

      // 媒体文件
      chainConfig.module
        .rule('media')
          .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
          .use('url-loader')
            .loader('url-loader')
            .options(genUrlLoaderOptions('media', subPackagesRoot))

      // 字体
      chainConfig.module
        .rule('fonts')
          .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
          .use('url-loader')
            .loader('url-loader')
            .options(genUrlLoaderOptions('fonts', subPackagesRoot))
      
      
          // 插件
      chainConfig
        .plugin('process-plugin')
          .use(webpack.ProgressPlugin)
          .end()
        .plugin('vue-loader-plugin')
          .use(VueLoaderPlugin)
          .end()
        .plugin('mini-css-extract-plugin')
					.use(MiniCssExtractPlugin, [{ filename: `[name].${cssExt}` }])
					.end()
      

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

    }
  })

  function resolveEntry () {
    // app entry
    const appEntry = findExisting(entryContext, [
      `app.${jsExt}`,
      `main.${jsExt}`,
      `index.${jsExt}`,
      'App.vue',
      'app.vue'
    ])

    if (!appEntry) {
      console.log(chalk.red(`Failed to locate entry file in ${chalk.yellow(entryContext)}.`))
      console.log(chalk.red(`Valid entry file should be one of: app.js, main.js, index.js, App.vue or app.vue.`))
      process.exit(1)
    }

    const appEntryPath = path.join(entryContext, appEntry)
    if (!fs.existsSync(appEntryPath)) {
      console.log(chalk.red(`Entry file ${chalk.yellow(appEntry)} does not exist.`))
      process.exit(1)
    }
    // 页面entry
    const { pagesEntry, getSubPackagesRoot } = require('@megalo/entry')
    // 获取用户定义的子包目录数组；目前假定用户都是把分包放src目录下的，目前分包放src外面生成路径会有问题（TODO 用户可自定义源码目录）
    const subPackagesRoot = Array.from(new Set(Object.values(getSubPackagesRoot(appEntryPath)))).map(subpackage => {
      return path.join(entryContextRelativePath, subpackage)
    })

    return { appEntry: appEntryPath, pagesEntry: pagesEntry(appEntryPath, options), subPackagesRoot }
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

  // 静态资源输出配置
  function genUrlLoaderOptions (dir, subPackagesRoot) {
    return {
      limit: 4096,
      // use explicit fallback to avoid regression in url-loader>=1.1.0
      fallback: {
        loader: 'file-loader',
        options: {
          publicPath: function(url, resourcePath, context) {
            // 找出资源属于哪一个子包
            const subPackage = subPackagesRoot.find(subPackage => {
              return path.relative(context, resourcePath).includes(subPackage + '/')
            })
            if (subPackage) {
              // 输出到子包目录
              return `${subPackage.replace(entryContextRelativePath + '/', '/')}/static/${dir}/${url}`
            }

            // 输出到主包目录
            return `/static/${dir}/${url}`
          },
          outputPath: function (url, resourcePath, context) {
            // 找出资源属于哪一个子包
            const subPackage = subPackagesRoot.find(subPackage => {
              return path.relative(context, resourcePath).includes(subPackage + '/')
            })
            if (subPackage) {
              // 输出到子包目录
              return `${subPackage.replace(entryContextRelativePath + '/', '')}/static/${dir}/${url}`
            }

            // 输出到主包目录
            return `static/${dir}/${url}`
          }
        }
      }
    }
  }
}

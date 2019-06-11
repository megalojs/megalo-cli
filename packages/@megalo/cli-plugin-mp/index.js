const fs = require('fs')
const chalk = require('chalk')
const path = require('path')
const { warn, getCssExt } = require('@megalo/cli-share-utils')
const { findExisting, checkFileExistsSync } = require('./utils')

module.exports = (api, options) => {
  const platform = process.env.PLATFORM
  const cssExt = getCssExt(platform)
  const isProd = process.env.NODE_ENV === 'production'
  const isTypescript = api.hasPlugin('typescript')
  const jsExt = ['js', 'ts'][+isTypescript]
  const entryContext = api.resolve('src')
  const entryContextRelativePath = path.relative(api.getCwd(), entryContext)

  // alpha 版本升级到 beta 版启用eslint时需要安装 @megalo/cli-plugin-eslint
  if (options.lintOnSave !== false && !api.hasPlugin('eslint')) {
    warn('升级提示："lintOnSave" 选项未生效，请先执行 "npm i @megalo/cli-plugin-eslint -D" 命令安装 @megalo/cli-plugin-eslint 插件')
  }

  if (api.hasPackage('typescript') && !isTypescript) {
    warn('升级提示：请执行 "npm i @megalo/cli-plugin-typescript -D" 命令安装 @megalo/cli-plugin-typescript 插件')
  }

  api.chainWebpack(chainConfig => {
    if (!['web', 'h5'].includes(platform)) {
      const webpack = require('webpack')
      const MiniCssExtractPlugin = require('mini-css-extract-plugin')
      const VueLoaderPlugin = require('vue-loader/lib/plugin')
      const TerserPlugin = require('terser-webpack-plugin')
      const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
      const CopyWebpackPlugin = require('copy-webpack-plugin')

      const { appEntry, pagesEntry, subPackagesRoot } = resolveEntry()
      const target = createTarget()
      const output = api.resolve(`dist-${platform}/`)

      // app和页面入口
      chainConfig.entry('app').clear().add(appEntry)
      const pages = Object.entries(pagesEntry)
      for (const [key, value] of pages) {
        chainConfig.entry(key).add(value)
      }

      chainConfig
        .devtool(isProd && !options.productionSourceMap ? 'none' : 'source-map')
        .target(target)
        .output
          .path(output)
          .filename('static/js/[name].js')
          .chunkFilename('static/js/[name].js')
          .pathinfo(false)

      // 提取公共文件、压缩混淆
      chainConfig.optimization
        .noEmitOnErrors(true)
        .runtimeChunk({ name: 'runtime' })
        .splitChunks({
          minSize: 30000,
          minChunks: 1,
          maxAsyncRequests: 5,
          maxInitialRequests: 3,
          name: false,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]|megalo[\\/]/,
              name: 'vendor',
              chunks: 'initial',
              priority: 10,
              reuseExistingChunk: false
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'initial',
              minSize: 1,
              priority: 0,
              reuseExistingChunk: true
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

      // alias
      chainConfig.resolve.alias.set('vue', 'megalo')

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

      // 处理js、ts
      chainConfig.module
      .rule('js')
        .test(/\.(ts|js)x?$/)
        .use('babel')
          .loader('babel-loader')

      // 占位
      chainConfig.module
        .rule('ts')

      // 静态资源输出配置
      const genUrlLoaderOptions = dir => {
        return {
          limit: 4096,
          // use explicit fallback to avoid regression in url-loader>=1.1.0
          fallback: {
            loader: 'file-loader',
            options: {
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
      // 图片
      chainConfig.module
        .rule('picture')
          .test(/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/)
          .use('url-loader')
            .loader('url-loader')
            .options(genUrlLoaderOptions('images'))

      // 媒体文件
      chainConfig.module
        .rule('media')
          .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
          .use('url-loader')
            .loader('url-loader')
            .options(genUrlLoaderOptions('media'))

      // 字体
      chainConfig.module
        .rule('fonts')
          .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
          .use('url-loader')
            .loader('url-loader')
            .options(genUrlLoaderOptions('fonts'))

      // css相关loader
      generateCssLoaders(chainConfig)

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

  function createTarget () {
    const createMegaloTarget = require('@megalo/target')
    const targetConfig = {
      compiler: Object.assign(require('@megalo/template-compiler'), {}),
      platform,
      projectOptions: options
    }
    const octoParsePath = checkFileExistsSync(`node_modules/octoparse/lib/platform/${platform}`)
    if (octoParsePath) {
      targetConfig.htmlParse = {
        templateName: 'octoParse',
        src: octoParsePath
      }
    } else {
      warn(
        `Current version of package 'octoparse' does not support 'v-html' directive in platform '${platform}'\n ` +
        `Please upgrade to the latest version and pay attention to the official website: https://github.com/kaola-fed/octoparse`
      )
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
          .when(projectOptions.css.loaderOptions['px2rpx'], rule => {
            rule.use('px2rpx')
              .loader('px2rpx-loader')
              .when(projectOptions.css.loaderOptions['px2rpx'], config => {
                config.tap(options => merge(options, projectOptions.css.loaderOptions['px2rpx']))
              })
            .end()
          })
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

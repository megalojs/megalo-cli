# @megalo/cli-service 1.x版本
:hammer_and_wrench: megalo的开箱即用webpack小程序脚手架配置，内置megalo生态的部分插件，并提供用户自定义配置的入口

完整文档地址: https://megalojs.org/#/cli/cli-service

## 特性
- 零配置可用
- 可根据自己的需求修改webpack原始配置
- 内置了小程序项目常用的基础设施配置，满足基本需求
- 项目配置分离，零耦和，配置插件化
- typescript 支持
- 插件系统

## 注意
老项目注意 >>> `@megalo/cli-service` 1.0.0版本的api于 0.x的版本不兼容,使用方式有差异，0.x版本的点击[这里
](./0.x-version.md)
## 安装
`@megalo/cli-service` 依赖 `@megalo/babel-preset-app` 、`@megalo/target` 、`@megalo/template-compiler`
```bash
npm i @megalo/babel-preset-app  @megalo/target @megalo/template-compiler @megalo/cli-service -D
```

## 使用

在项目根目录的`package.json`文件中的`scripts`选项加上一条:
```json
"scripts": {
  "dev:wechat": "megalo-cli-service serve"
}
```

运行命令:
```bash
npm run dev:wechat
```

## 控制台参数
https://megalojs.org/#/cli/cli-service

## 修改配置

如果你觉得webpack配置不满足项目需求，你可以在项目根目录下，新建一个`megalo.config.js`文件，书写自己的配置并导出，目前该配置文件的默认配置如下（均为选填）：
```js
module.exports = {
  // 构件生产模式时是否启用sourcemap配置（仅在process.env.NODE_ENV === 'production' 时该选项生效）
  productionSourceMap: false,

  // 是否在开发环境下通过 eslint-loader 在每次保存时 lint 代码
  lintOnSave: true,

  chainWebpack: chainConfig => {
    // 你可以在这里通过 https://github.com/neutrinojs/webpack-chain 来精细的修改webpack配置
    console.log('chainWebpack执行了', chainConfig.toString())
  },

  configureWebpack: config => {
    // 你可以在这里修改webpack的配置并返回,或者直接创建一个新的webpack配置对象返回;
    // 你的配置将被 webpack-merge 合并 (https://github.com/survivejs/webpack-merge)
    return config
  },
  // 原生小程序组件存放目录，默认为src/native
  // 如果你有多个平台的原生组件，你应当在此目录下再新建几个子文件夹，我们约定，子文件夹名和平台的名字一致:
  // 微信小程序组件则命名为 'wechat'，支付宝为'alipay', 百度为 'swan'
  // 如果只有一个平台，则无需再新建子文件夹
  nativeDir: '/src/native',

  // 文档同 https://cli.vuejs.org/zh/config/#css-loaderoptions
  css: {
    loaderOptions: {
      css: {
        // https://github.com/webpack-contrib/css-loader#options
      },
      less: {
        // https://github.com/webpack-contrib/less-loader
      },
      sass: {
        // https://github.com/webpack-contrib/sass-loader
      },
      stylus: {
        // https://github.com/shama/stylus-loader
      },
      // 若不想使用 px2rpx 插件，则设置为 px2rpx: false 即可
      px2rpx: {
        // https://github.com/megalojs/megalo-px2rpx-loader
        rpxUnit: 0.5
      }
    }
  }
}

```


## 插件系统
`@megalo/cli-service` 从 1.0.0-beta.1 起， 支持插件系统
[插件开发文档](./plugin.md)

## 已内置的megalo周边webpack配置
以下使用以下 `megalo` 周边库时，直接 `npm i 库名` 即可，无需更改 `webpack` 配置，直接使用：
- [megalo-api](https://github.com/megalojs/megalo-api)  （重新封装各个端中的API，由 megalo 统一对外抛出方法名）
- [megalo-px2rpx-loader](https://github.com/megalojs/megalo-px2rpx-loader)  (将项目中的 `px` 单位统一转成 `rpx` 单位)
- [megalo-vhtml-plugin](https://github.com/megalojs/megalo-vhtml-plugin)  （富文本库）

内置的其他的 `webpack` 配置：
- 环境变量设置、替换
- css-loader、less-loader、sass-loader、stylus-loader等 css预编译相关配置
- file-loader 处理图片资源文件
- babel 转 es5
- 编译、压缩、混淆等

## 注意
`@megalo/cli-service` 默认会读取 `src` 目录下的  `app.js` 、 `main.js` 、 `index.js` 、 `app.ts`、 `main.ts` 、`index.ts`  其中之一并将其作为入口文件

## [demo](../../../example/)


## 更新记录
- ［ 1.0.0-alpha.18 ］ 支持头条小程序
- ［ 1.0.0-beta.1 ］
  - 剥离webpack配置，支持[插件系统](./plugin.md)
  - 新增 `cli-plugin-mp`、 `cli-plugin-web`、 `cli-plugin-eslint`、 `cli-plugin-typescript` 插件
  - 编译小程序为H5(目前周边设施还不完善)
  - 默认新增webpack对fonts、媒体文件等静态资源的webpack配置
  - 优化分包静态资源输出路径，主包的图片(images)、字体(fonts)、媒体文件(media)输出到 `dist-${platform}/static/${fileType}/` 目录下；分包的输出到`dist-${platform}/${packageName}/static/${fileType}`目录下

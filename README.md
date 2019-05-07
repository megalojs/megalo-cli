# megalo-cli
Standard Tooling for Megalo Project Development

## 本仓库维护下列包：

| 包名 | 最新版本号 | 包描述
| ------ | ------ | ------ |
| [@megalo/cli](./packages/@megalo/cli) | 1.0.0-beta.1 | 生成标准的megalo项目，生成后与用户无关 |
| [@megalo/cli-service](./packages/@megalo/cli-service) | 1.0.0-beta.1 | megalo项目的webpack零配置插件，支持修改配置，支持插件化加载用户配置，直接对用户提供服务（核心）
| [@megalo/cli-plugin-mp](./packages/@megalo/cli-plugin-mp) | 1.0.0-beta.1 | megalo项目默认编译小程序的webpack零配置插件，@megalo/cli-service内部默认加载该插件
| [@megalo/cli-plugin-web](./packages/@megalo/cli-plugin-web) | 1.0.0-alpha.4 | megalo项目默认编译h5的webpack零配置插件,@megalo/cli-service内部默认加载该插件
| [@megalo/cli-plugin-eslint](./packages/@megalo/cli-plugin-eslint) | 1.0.0-beta.1 | megalo项目 eslint 插件，提供代码格式检查、自动修复等功能，安装到 package.json 中即可自动被启用，直接对用户提供服务
| [@megalo/cli-plugin-typescript](./packages/@megalo/cli-plugin-typescript) | 1.0.0-beta.1 | megalo项目 typescript 插件，提供编译typescript、typescript类型检查功能，配合 @megalo/cli-plugin-eslint 提供代码格式检查、自动修复等功能，安装到 package.json 中即可自动被启用，直接对用户提供服务
| [@megalo/cli-share-utils](./packages/@megalo/cli-share-utils) | 1.0.0-beta.1 | cli中用到的可剥离出来的公共函数
| [@megalo/entry](./packages/@megalo/entry) | 0.1.2 | 读取入口文件的webpack插件 |
| [@megalo/babel-preset-app](./packages/@megalo/babel-preset-app) | 1.0.0-alpha.5 | 包装脚手架babel相关的配置，直接对用户提供服务 |


## 其他相关包
| 包名 | 最新版本号 | 包描述
| ------ | ------ | ------ |
| [@megalo/eslint-config-standard](https://github.com/megalojs/eslint-config-standard) | 1.0.0 | eslint-config-standard for megalo project |
| [@megalo/eslint-config-typescript](https://github.com/megalojs/eslint-config-typescript) | 1.0.0-alpha.1 | eslint-config-typescript for magolo-cli |


## 社区贡献的cli插件
| 包名 | 包描述
| ------ | ------ |
| 待定 | 待定 |


> 注： alpha 为内部开发测试版本，部分API可能随有变动，请谨慎在生产环境中使用；beta 为公测版本, api 基本稳定

## 推荐运行环境
- nodejs 9 +

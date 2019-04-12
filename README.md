# megalo-cli
Standard Tooling for Megalo Project Development

## 本仓库维护下列包：

| 包名 | 最新版本号 | 最后更新日期 | 包描述
| ------ | ------ | ------ | ------ |
| [@megalo/cli](./packages/@megalo/cli) | 1.0.0-alpha.5 | 2019/04/04 | 生成标准的megalo项目，生成后与用户无关 |
| [@megalo/cli-service](./packages/@megalo/cli-service) | 1.0.0-alpha.19 | 2019/04/12 | megalo项目的webpack零配置插件，直接对用户提供服务
| [@megalo/cli-plugin-mp](./packages/@megalo/cli-plugin-mp) | 1.0.0-alpha.1 | 2019/04/12 | megalo项目默认编译小程序的webpack零配置插件，@megalo/cli-service内部默认加载该插件
| [@megalo/cli-plugin-web](./packages/@megalo/cli-plugin-web) | 1.0.0-alpha.1 | 2019/04/12 | megalo项目默认编译h5的webpack零配置插件,@megalo/cli-service内部默认加载该插件
| [@megalo/entry](./packages/@megalo/entry) | 0.1.2 | 2019/03/01 | 读取入口文件的webpack插件（未来可能废弃，交由megalo-aot处理） |
| [@megalo/babel-preset-app](./packages/@megalo/babel-preset-app) | 1.0.0-alpha.5 | 2019/04/04 | 包装脚手架babel相关的配置，直接对用户提供服务 |

## 其他相关包
| 包名 | 最新版本号 | 最后更新日期 | 包描述
| ------ | ------ | ------ | ------ |
| [@megalo/eslint-config-standard](https://github.com/megalojs/eslint-config-standard) | 1.0.0 | 2019/03/21 | eslint-config-standard for megalo project |
| [@megalo/eslint-config-typescript](https://github.com/megalojs/eslint-config-typescript) | 1.0.0-alpha.1 | 2019/03/25 | eslint-config-typescript for magolo-cli |


> 注： alpha 为内部开发测试版本，部分API可能随有变动，请谨慎在生产环境中使用

## 推荐运行环境
- nodejs 9 +

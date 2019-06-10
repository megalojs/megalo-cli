# @megalo/cli-plugin-flx-es6-to-es5
解决小程序开发工具勾选es6转es5报错的问题

## 解决思路：
- fock [`regenerator-runtime`](https://github.com/facebook/regenerator/tree/master/packages/regenerator-runtime) 仓库，注释掉编译报错代码，发布新包 `fock-regenerator-runtime`
- 通过 `webpack` 的 `alias` 设置 将 `regenerator-runtime` 替换成 `fock-regenerator-runtime`

## 缺点：官方更新，这里也要更新，同步版本号

## 注意： 此插件只适用于 `@megalo/cli` beta及其以上版本创建的项目(@megalo/cli-service beta及其以上版本)


## 使用方式：

``` bash
npm i @megalo/cli-plugin-flx-es6-to-es5 -D
```

安装后 `@megalo/cli-service` 会自动加载该插件

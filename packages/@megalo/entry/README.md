# megalo-entry
解析配置在 `main.js` 或者 `App.vue` 中的 [小程序全局配置](https://developers.weixin.qq.com/miniprogram/dev/framework/config.html#%E5%85%A8%E5%B1%80%E9%85%8D%E7%BD%AE)并生成webpack所需要的entry键值对

## 单独使用

``` bash
# npm i @megalo/entry -D
```

``` js
const entryPath = 'main.js或者App.vue文件路径'
const { pagesEntry, getSubPackagesRoot } = require('@megalo/entry')

pagesEntry(entryPath)
getSubPackagesRoot(entryPath)
```


参考例子: https://github.com/megalojs/megalo-cli/blob/882229133d7d92a9398c96620b9b7bc96dda74e0/packages/%40megalo/cli-plugin-mp/index.js#L255

## cli集成
`megalo-cli` 内部已经默认集成该库

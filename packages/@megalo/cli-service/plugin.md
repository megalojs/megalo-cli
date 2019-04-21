# 插件开发指南

## 核心概念

系统里有两个主要的部分：

- `@megalo/cli`：全局安装的，暴露 `megalo <app>` 命令；
- `@megalo/cli-service`：局部安装，暴露 `megalo-cli-service` 命令。

后者皆应用了基于插件的架构。

### Service

[Service](https://github.com/megalojs/megalo-cli/blob/master/packages/@megalo/cli-service/lib/Service.js) 是调用 `megalo-cli-service <command> [...args]` 时创建的类。负责管理内部的 webpack 配置、暴露服务和构建项目的命令等。


### Service 插件

Service 插件会在一个 Service 实例被创建时自动加载——比如每次 `megalo-cli-service` 命令在项目中被调用时。

注意我们这里讨论的“service 插件”的概念要比发布为一个 npm 包的“CLI 插件”的要更窄。前者涉及一个会被 `@megalo/cli-service` 在初始化时加载的模块，也经常是后者的一部分。

此外，`@megalo/cli-service` 的[内建命令][commands]和[配置模块][config]也是全部以 service 插件实现的。

一个 service 插件应该导出一个函数，这个函数接受两个参数：

- 一个 [PluginAPI][plugin-api] 实例

- 一个包含 `megalo.config.js` 内指定的项目本地选项的对象

这个 API 允许 service 插件针对不同的环境扩展/修改内部的 webpack 配置，并向 `megalo-cli-service` 注入额外的命令。例如：

``` js
module.exports = (api, projectOptions) => {
  api.chainWebpack(webpackConfig => {
    // 通过 webpack-chain 修改 webpack 配置
  })

  api.configureWebpack(webpackConfig => {
    // 修改 webpack 配置
    // 或返回通过 webpack-merge 合并的配置对象
  })

  api.registerCommand('test', args => {
    // 注册 `megalo-cli-service test`
  })
}
```



#### 为命令指定模式

如果一个已注册的插件命令需要运行在特定的默认模式下，则该插件需要通过 `module.exports.defaultModes` 以 `{ [commandName]: mode }` 的形式来暴露：

``` js
module.exports = api => {
  api.registerCommand('build', () => {
    // ...
  })
}

module.exports.defaultModes = {
  build: 'production'
}
```

这是因为我们需要在加载环境变量之前知道该命令的预期模式，所以需要提前加载用户选项/应用插件。


#### 在插件中解析 webpack 配置

一个插件可以通过调用 `api.resolveWebpackConfig()` 取回解析好的 webpack 配置。每次调用都会新生成一个 webpack 配置用来在需要时进一步修改。

``` js
module.exports = api => {
  api.registerCommand('my-build', args => {
    const configA = api.resolveWebpackConfig()
    const configB = api.resolveWebpackConfig()

    // 针对不同的目的修改 `configA` 和 `configB`...
  })
}

// 请确保为正确的环境变量指定默认模式
module.exports.defaultModes = {
  'my-build': 'production'
}
```

或者，一个插件也可以通过调用 `api.resolveChainableWebpackConfig()` 获得一个新生成的[链式配置](https://github.com/mozilla-neutrino/webpack-chain)：

``` js
api.registerCommand('my-build', args => {
  const configA = api.resolveChainableWebpackConfig()
  const configB = api.resolveChainableWebpackConfig()

  // 针对不同的目的链式修改 `configA` 和 `configB`...

  const finalConfigA = configA.toConfig()
  const finalConfigB = configB.toConfig()
})
```


#### 第三方插件的自定义选项

`megalo.config.js` 的导出将会[通过一个 schema 的验证](https://github.com/bigmeow/megalo-cli/blob/e646e6fa5058d5481f92675aabefde1b08edeffa/packages/@megalo/cli-service/lib/options.js#L3)以避免笔误和错误的配置值。然而，一个第三方插件仍然允许用户通过 `pluginOptions` 字段配置其行为。例如，对于下面的 `megalo.config.js`：

``` js
module.exports = {
  pluginOptions: {
    foo: { /* ... */ }
  }
}
```

该第三方插件可以读取 `projectOptions.pluginOptions.foo` 来做条件式的决定配置。


## 发布插件

为了让一个 CLI 插件能够被其它开发者使用，你必须遵循 `megalo-cli-plugin-<name>` 的命名约定将其发布到 npm 上。插件遵循命名约定之后就可以：

- 被 `@megalo/cli-service` 发现, 只要将其安装到项目的 `package.json` 依赖中， `@megalo/cli-service` 会自动加载该插件；
- 被其它开发者搜索到。

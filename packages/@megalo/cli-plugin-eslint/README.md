# @megalo/cli-plugin-mp

> eslint plugin for megalo-cli

## 注入的命令

- **`megalo-cli-service lint`**

  ```
  Usage: megalo-cli-service lint [options] [...files]

  Options:

    --format [formatter] specify formatter (default: codeframe)
    --no-fix             do not fix errors
    --max-errors         specify number of errors to make build failed (default: 0)
    --max-warnings       specify number of warnings to make build failed (default: Infinity)
  ```

  检查提示以及修复文件格式。 如果没有特别指定文件或目录，默认情况下它会检查 `src` 和 `test` 目录下的所有文件

  另外 [ESLint CLI options](https://eslint.org/docs/user-guide/command-line-interface#options) 这里的选项也是支持的.

## 配置

ESLint可以通过 `.eslintrc` 或 `package.json` 中的 `eslintConfig` 字段进行配置。

默认情况下启用 `eslint-loader` 进行开发时的保存。 可以使用 `megalo.config.js` 中的 `lintOnSave` 选项禁用它：

``` js
module.exports = {
  lintOnSave: false
}
```

设置为 `true` 时，`eslint-loader` 会将 lint 错误输出为编译警告。默认情况下，警告仅仅会被输出到命令行，且不会使得编译失败。

如果你希望让 `lint` 错误在开发时直接显示在浏览器中，你可以使用 `lintOnSave: 'error'`。这会强制 `eslint-loader` 将 `lint` 错误输出为编译错误，同时也意味着 `lint` 错误将会导致编译失败。

或者，你也可以通过设置让浏览器 `overlay` 同时显示警告和错误：

``` js
// megalo.config.js
module.exports = {
  // 编译小程序不支持该选项
  devServer: {
    overlay: {
      warnings: true,
      errors: true
    }
  }
}
```

当 `lintOnSave` 是一个 truthy 的值时，`eslint-loader` 在开发和生产构建下都会被启用。如果你想要在生产构建时禁用 `eslint-loader`，你可以用如下配置：

``` js
// megalo.config.js
module.exports = {
  lintOnSave: process.env.NODE_ENV !== 'production'
}
```

## 注入的 webpack-chain 规则

- `config.module.rule('eslint')`
- `config.module.rule('eslint').use('eslint-loader')`

# @megalo/cli-plugin-typescript

> typescript plugin for megalo-cli

使用 `TypeScript` + `ts-loader` + `fork-ts-checker-webpack-plugin` 进行类型检查.

## 配置

可以通过 `tsconfig.json` 配置 `TypeScript`.

此插件依赖 `TypeScript` , 你可以在项目的 `package.json` 安装适合自己的 `typescript` 版本.

这个插件可以和 `@megalo/cli-plugin-babel` 一起使用. 与Babel一起使用时，此插件将输出ES2015，并根据babel配置将其余部分交给Babel进行自动编译转换.


## 注入的命令

使用 `ts-lint` 修复代码格式

- **`megalo-cli-service lint`**

  ```
  Usage: megalo-cli-service lint [options] [...files]

  Options:

    --format [formatter] specify formatter (default: codeframe)
    --no-fix             do not fix errors
    --formatters-dir         formatter directory
    --rules-dir       rules directory
  ```

## 注入的 webpack-chain 规则

- `config.rule('ts')`
- `config.rule('ts').use('ts-loader')`
- `config.plugin('fork-ts-checker')`

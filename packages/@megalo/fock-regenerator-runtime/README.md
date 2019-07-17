# fock-regenerator-runtime

此包fock自[regenerator-runtime](https://github.com/facebook/regenerator/tree/master/packages/regenerator-runtime),主要解决小程序开发工具开启es6转es5时的报错问题，按照 `regenerator-runtime` 官方仓库的说法，开启babel严格模式时会有这个问题，并且它使用 `Function("r", "regeneratorRuntime = r")(runtime);`  这行代码来解决，遗憾的是 小程序不支持 `Function` 函数动态注入代码，并且会报错，导致编译不通过。

在和官方沟通无果后，基于此，本仓库Fock了 `regenerator-runtime` 的代码，把出错的导致这行代码编译不通过的代码注释掉了， 并且通过`webpack` 的 `alias` 将 `regenerator-runtime` 替换成本包。具体修改的代码在 `runtime.js` 末尾的最后几行，如果你有更好的解决方案，欢迎提issues


Standalone runtime for
[Regenerator](https://github.com/facebook/regenerator)-compiled generator
and `async` functions.

To import the runtime as a module (recommended), either of the following
import styles will work:
```js
// CommonJS
const regeneratorRuntime = require("regenerator-runtime");

// ECMAScript 2015
import regeneratorRuntime from "regenerator-runtime";
```

To ensure that `regeneratorRuntime` is defined globally, either of the
following styles will work:
```js
// CommonJS
require("regenerator-runtime/runtime");

// ECMAScript 2015
import "regenerator-runtime/runtime";
```

To get the absolute file system path of `runtime.js`, evaluate the
following expression:
```js
require("regenerator-runtime/path").path
```

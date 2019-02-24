# px2rpx-loader

a [webpack](http://webpack.github.io/) loader for [px2rpx](https://github.com/megalojs/megalo-px2rpx)

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]

[npm-image]: https://img.shields.io/npm/v/@megalo/px2rpx-loader.svg
[npm-url]: https://npmjs.org/package/@megalo/px2rpx-loader
[travis-image]: https://img.shields.io/travis/megalojs/megalo-px2rpx-loader.svg
[travis-url]: https://travis-ci.org/megalojs/megalo-px2rpx-loader
[downloads-image]: http://img.shields.io/npm/dm/@megalo/px2rpx-loader.svg
[downloads-url]: https://npmjs.org/package/@megalo/px2rpx-loader

## Install

`npm install px2rpx-loader`

## webpack config

```
module.exports = {
  // ...
  module: {
    rules: [{
      test: /\.css$/,
      use: [{
        loader: 'style-loader'
      }, {
        loader: 'css-loader'
      }, {
        loader: 'px2rpx-loader',
        // options here
        options: {
          rpxUnit: 1,
          rpxPrecision: 6
        }
      }]
    }]
  }
}
```

Please see [px2rpx](https://github.com/megalojs/megalo-px2rpx) for more information about query parameters of px2rpx.

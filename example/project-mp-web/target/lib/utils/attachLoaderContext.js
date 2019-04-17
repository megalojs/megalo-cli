module.exports = function attachLoaderContext( id, compiler, callback ) {
  if ( compiler.hooks ) {
    // webpack 4
    compiler.hooks.compilation.tap(id, compilation => {
      compilation.hooks.normalModuleLoader.tap(id, loaderContext => {
        callback( loaderContext )
      })
    })
  } else {
    // webpack < 4
    compiler.plugin('compilation', compilation => {
      compilation.plugin('normal-module-loader', loaderContext => {
        callback( loaderContext )
      })
    })
  }
}

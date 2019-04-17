const loaderUtils = require( 'loader-utils' )

module.exports = function( loaderContext, loaders, resource = {} ) {
  const resourcePath = typeof resource.resourcePath !== 'undefined' ?
    resource.resourcePath :
    loaderContext.resourcePath

  const resourceQuery = typeof resource.resourceQuery !== 'undefined' ?
    resource.resourceQuery :
    loaderContext.resourceQuery

  // Important: dedupe since both the original rule
  // and the cloned rule would match a source import request.
  // also make sure to dedupe based on loader path.
  // assumes you'd probably never want to apply the same loader on the same
  // file twice.
  const seen = new Map()
  const loaderStrings = []

  loaders.forEach(loader => {
    const type = typeof loader === 'string' ? loader : loader.path
    const request = typeof loader === 'string' ? loader : loader.request
    if (!seen.has(type)) {
      seen.set(type, true)
      // loader.request contains both the resolved loader path and its options
      // query (e.g. ??ref-0)
      loaderStrings.push(request)
    }
  })

  return loaderUtils.stringifyRequest(loaderContext, '-!' + [
    ...loaderStrings,
    resourcePath + resourceQuery
  ].join('!'))
}

const path = require( 'path' )
const loaderUtils = require('loader-utils')
const { parse } = require('@vue/component-compiler-utils')

module.exports = function( source ) {
  const loaderContext = this

  const {
    sourceMap,
    rootContext,
    resourcePath,
  } = loaderContext

  const options = loaderUtils.getOptions(loaderContext) || {}

  const filename = path.basename(resourcePath)
  const context = rootContext || process.cwd()
  const sourceRoot = path.dirname(path.relative(context, resourcePath))

  const descriptor = parse({
    source,
    compiler: options.compiler || require( '@megalo/regular-template-compiler' ),
    filename,
    sourceRoot,
    needMap: sourceMap
  })

  loaderContext.resourcePath += '.' + (descriptor.template.lang || 'html')

  loaderContext.callback( null, descriptor, null )
}

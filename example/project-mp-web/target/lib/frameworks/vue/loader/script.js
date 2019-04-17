const extractCompilerOptionsFromScriptSource =
  require( '../../shared/utils/extractCompilerOptionsFromScriptSource' )
const extractPageFromScriptSource =
  require( '../../shared/utils/extractPageFromScriptSource' )
const extractComponentsPlugin = require( '../babel-plugins/extract-components' )
const removeExtension = require( '../../../utils/removeExtension' )

module.exports = function ( source ) {
  const loaderContext = this
  const realResourcePath = removeExtension( loaderContext.resourcePath )

  const jobs = [
    extractCompilerOptionsFromScriptSource( source, extractComponentsPlugin, loaderContext ),
    extractPageFromScriptSource( source, loaderContext ),
  ]

  const deferred = loaderContext.megaloDeferred( realResourcePath )

  Promise.all( jobs )
    .then( deferred.resolve )
    .catch( deferred.reject )

  return source
}

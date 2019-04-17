const path = require( 'path' )
const { babel } = require( '../utils/babel' )
const extractConfigPlugin = require( '../babel-plugins/extract-config' )
const entryComponentPlugin = require( '../babel-plugins/entry-component' )
const mpTypePlugin = require( '../babel-plugins/mptype' )
const resolveSource = require( '../utils/resolveSource' )
const hashify = require( '../utils/hashify' )

module.exports = function ( source ) {
  const loaderContext = this
  const entryHelper = loaderContext.megaloEntryHelper
  const callback = loaderContext.async()
  let sourcemap = null

  if ( entryHelper.isEntry( loaderContext.resourcePath ) ) {
    const entryKey = entryHelper.getEntryKey( loaderContext.resourcePath )

    const babelOptions = {
      filename: loaderContext.resourcePath,
      plugins: [
        extractConfigPlugin,
        entryComponentPlugin,
        mpTypePlugin( entryKey === 'app' ? 'app' : 'page' )
      ]
    }

    let code, map, metadata

    try {
      const result = babel.transform( source, babelOptions )
      code = result.code
      map = result.map
      metadata = result.metadata
    } catch ( e ) {
      callback( e )
    }

    source = code
    sourcemap = map

    const megaloConfig = ( metadata.megaloConfig && metadata.megaloConfig.value ) || {}
    const entryComponent = metadata.megaloEntryComponent

    if ( !entryComponent ) {
      callback( new Error( 'Cannot resolve entry component for ' + entryKey ) )
      return
    }

    resolveSource.call( loaderContext, entryComponent )
      .then( resolved => {
        loaderContext.megaloCacheToPages( {
          file: entryKey,
          config: megaloConfig,
          entryComponent: {
            name: hashify( resolved ),
          },
        } )

        callback( null, source, sourcemap )
      }, e => {
        callback( e, source, sourcemap )
      } )
  } else {
    callback( null, source, sourcemap )
  }
}

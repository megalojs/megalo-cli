const { babel } = require( '../../../utils/babel' )
const extractConfigPlugin = require( '../../../babel-plugins/extract-config' )
const entryComponentPlugin = require( '../../../babel-plugins/entry-component' )
const mpTypePlugin = require( '../../../babel-plugins/mptype' )
const resolveSource = require( '../../../utils/resolveSource' )
const hashify = require( '../../../utils/hashify' )
const removeExtension = require( '../../../utils/removeExtension' )

module.exports = function ( source, loaderContext ) {
  const entryHelper = loaderContext.megaloEntryHelper

  const resourcePath = removeExtension( loaderContext.resourcePath )

  if ( entryHelper.isEntry( resourcePath ) ) {
    const entryKey = entryHelper.getEntryKey( resourcePath )

    return Promise.resolve( {
      file: entryKey,
      config: null,
      entryComponent: {
        name: hashify( resourcePath ),
      },
    } )
  }

  return Promise.resolve( null )
}

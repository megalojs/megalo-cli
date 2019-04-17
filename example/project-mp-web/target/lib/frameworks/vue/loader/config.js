const path = require( 'path' )
const qs = require( 'qs' )
const parseConfig = require('../../../utils/parseConfig')

module.exports = function ( source ) {
  const loaderContext = this
  const entryHelper = loaderContext.megaloEntryHelper
  const resourcePath = loaderContext.resourcePath
  const query = qs.parse( loaderContext.resourceQuery.slice( 1 ) ) || {}
  const lang = query.lang || 'json'

  if ( entryHelper.isEntry( loaderContext.resourcePath ) ) {
    parseConfig( {
      source,
      lang,
      filepath: resourcePath,
    }, function ( e, config ) { // sync callback
      if ( e ) {
        loaderContext.emitError( getParseError( e, source, resourcePath ) )
        return
      }

      const entryKey = entryHelper.getEntryKey( loaderContext.resourcePath )

      loaderContext.megaloCacheToPages( {
        file: entryKey,
        config: config,
      } )
    } )
  }

  return ''
}

function getParseError( e, source, resourcePath ) {
  const relativePath = path.relative( process.cwd(), resourcePath )
  const reason = `
[@MEGALO/TARGET] Failed to parse <config> block in ${ relativePath },

<config>
${ source.trim() }
</config>

Details: ${ e.message }
`

  return new Error( reason )
}

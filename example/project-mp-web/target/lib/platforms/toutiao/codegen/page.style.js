const relativeToRoot = require( '../../shared/utils/relativeToRoot' )

module.exports = function ( { file, files = {}, htmlParse, htmlParsePaths = {} } = {} ) {
  const htmlparse = htmlParse ? [ htmlParsePaths.style ] : []
  const split = files.split.style || []
  const main = files.main.style || []

  return htmlparse
    .concat( split )
    .concat( main )
    .map( s => `@import "${ relativeToRoot( file ) }${ s }"` )
    .join( ';\n' )
}

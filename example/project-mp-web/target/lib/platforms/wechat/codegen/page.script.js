const relativeToRoot = require( '../../shared/utils/relativeToRoot' )

module.exports = function ( { file, files = {} } = {} ) {
  const split = files.split.js || []
  const main = files.main.js || []
  return split
    .concat( main )
    .map( j => `require('${ relativeToRoot( file ) }${ j }')` )
    .join( '\n' )
}

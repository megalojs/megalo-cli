const path = require( 'path' )
const hash = require( 'hash-sum' )
const removeExtension = require( './removeExtension' )

module.exports = function ( filepath ) {
  const filename = removeExtension( path.basename( filepath ) )
  const relativePath = removeExtension( path.relative( process.cwd(), filepath ) )
  return `${ filename }$${ hash( relativePath ) }`
}

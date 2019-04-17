const crypto = require( 'crypto' )

module.exports = function md5( str ) {
  const hash = crypto.createHash( 'md5' )
  hash.update( str )
  return hash.digest( 'hex' )
}
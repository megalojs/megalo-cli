const path = require( 'path' )
const hash = require( 'hash-sum' )

const _caches = {}

function findSubpackage( filepath, subpackages ) {
  const cacheKey = hash( { filepath, subpackages } )

  if ( _caches[ cacheKey ] ) {
    return _caches[ cacheKey ]
  }

  // fix windows path
  filepath = filepath.replace( /\\/g, '/' )

  const found = subpackages.find( pkg => {
    const root = pkg.root || ''
    const pages = pkg.pages || []
    const fullpaths = pages.map( page => {
      // TODO: pkg.root + '/' is not the best way to detect
      return pkg.root + '/'
    } ).filter( Boolean )

    if ( fullpaths.length === 0 ) {
      return false
    }

    const inSubpackage = new RegExp( fullpaths.join( '|' ) )

    if ( inSubpackage.test( filepath ) ) {
      return true
    }
  } )

  _caches[ cacheKey ] = found

  return found
}

function inSubpackage( filepath, subpackages ) {
  return !!findSubpackage( filepath, subpackages )
}

module.exports = { findSubpackage, inSubpackage }

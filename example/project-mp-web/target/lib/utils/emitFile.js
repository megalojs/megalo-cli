const fs = require( 'fs' )
const toAsset = require( './toAsset' )
const getMD5 = require( './md5' )

const emitteds = {}

module.exports = function emitFile( filepath, source = '', compilation ) {
  const md5 = getMD5( filepath + source )
  const emiited = emitteds[ filepath ]

  // don't emit the same files
  // TODO: remove fs module
  if ( (emiited && emiited === md5) || fs.existsSync( filepath ) ) {
    return
  }
  emitteds[ filepath ] = md5
  compilation.assets[ filepath ] = toAsset( source )
}

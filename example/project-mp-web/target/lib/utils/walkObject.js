const toString = Object.prototype.toString

module.exports = function walkObject( target, callback ) {
  if ( !target || typeof target !== 'object' ) {
    return
  }

  Object.keys( target ).forEach( key => {
    const value = target[ key ]

    if ( value && typeof value === 'object' ) {
      walkObject( value, callback )
    } else {
      callback( value, key, target )
    }
  } )
}

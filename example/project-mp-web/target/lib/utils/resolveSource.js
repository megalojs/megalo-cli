module.exports = function ( source ) {
  return new Promise( ( resolve, reject ) => {
    this.resolve( this.context, source, ( err, filepath ) => {
      if ( err ) {
        reject( err )
        return
      }

      resolve( filepath )
    } )
  } )
}

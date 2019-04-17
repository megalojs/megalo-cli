module.exports = function emitError( compilation, error ) {
  if ( !( error instanceof Error ) ) {
    error = new Error( error )
  }

  compilation.errors.push( error )
}

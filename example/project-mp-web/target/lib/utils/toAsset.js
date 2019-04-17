module.exports = function ( source ) {
  return {
    size() {
      return Buffer.byteLength( source, 'utf8' )
    },

    source() {
      return source
    }
  }
}

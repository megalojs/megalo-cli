module.exports = function removeExtension( str, extension ) {
  if ( extension ) {
    const reg = new RegExp( extension.replace( /\./, '\\.' ) + '$' )
    return str.replace( reg, '' )
  }

  return str.replace( /\.\w+$/g, '' )
}

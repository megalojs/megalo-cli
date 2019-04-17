module.exports = function ( filepath ) {
  const times = filepath.split( '/' ).length - 1

  return times > 0 ?
    repeat( '../', times ) :
    './'
}

function repeat( str, len ) {
  let result = ''

  while ( len-- ) {
    result += str
  }

  return result
}

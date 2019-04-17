module.exports = function renamePorps( obj, nameMap ) {
  return Object.keys(obj).reduce( ( res, key ) => {
    const propName = nameMap[ key ] || key
    res[ propName ] = obj[ key ]
    return res;
  }, {} )
}

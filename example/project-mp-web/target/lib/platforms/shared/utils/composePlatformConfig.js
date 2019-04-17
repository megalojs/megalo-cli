const merge = require('lodash.merge');

module.exports = function( config, platform ) {
  const res = Object
    .keys( config )
    .filter(key => !/_/.test(key))
    .reduce( ( obj, key ) => {
      obj[ key ] = config[ key ]
      return obj
    }, {} )

  const platformKey = `_${platform}`
  return merge( res, config[ platformKey ] || {} )
}
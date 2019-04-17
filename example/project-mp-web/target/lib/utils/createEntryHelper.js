module.exports = function createEntryHelper( entries = {} ) {
  return {
    isEntry: function isEntry( filepath = '' ) {
      return !!Object.keys( entries )
        .some( key => {
          const entry = entries[ key ]
          if (Array.isArray( entry )) {
            return entry.indexOf( filepath ) > -1
          } else {
            return entry === filepath
          }
        } )
    },

    getEntryKey: function getEntryKey( filepath = '' ) {
      return Object.keys( entries )
        .find( key => {
          const entry = entries[ key ]
          if (Array.isArray( entry )) {
            return entry.indexOf( filepath ) > -1
          } else {
            return entry === filepath
          }
        } )
    }
  }
}

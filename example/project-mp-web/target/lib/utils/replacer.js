const regexp = /_o_\d+_O_([\s\S]+?)_O_\d+_o_/g

const replacer = {
  _id: 0,

  encode( str ) {
    this._id++
    return `_o_${ this._id }_O_${ str }_O_${ this._id }_o_`
  },

  clean( content ) {
    return content.replace( regexp, ( all, $0 ) => {
      return $0
    } )
  },

  decode( content, callback ) {
    return content.replace( regexp, ( all, $0 ) => {
      return callback( $0 )
    } )
  },

  isEncoded( content ) {
    if ( typeof content === 'string' ) {
      return regexp.test( content )
    }

    return false
  }
}

module.exports = replacer

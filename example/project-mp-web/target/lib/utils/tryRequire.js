module.exports = function ( name, fallbackName ) {
  let mod

  try {
    mod = require( name )
  } catch ( e ) {
    if (e.code === "MODULE_NOT_FOUND") {
      try {
        mod = require( fallbackName )
      } catch ( e ) {}
    }
  }

  return mod
}

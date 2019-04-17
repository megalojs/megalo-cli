// normalize createMegaloTarget -> options.compiler
module.exports = function ( compiler ) {
  const normalized = {}

  if ( compiler && compiler.parseComponent && !compiler.vue && !compiler.regular ) {
    normalized.vue = compiler
    normalized.regular = require( '@megalo/regular-template-compiler' )
  } else {
    if ( compiler && compiler.vue ) {
      normalized.vue = compiler.vue
    } else {
      normalized.vue = require( '@megalo/template-compiler' )
    }

    if ( compiler && compiler.regular ) {
      normalized.regular = compiler.regular
    } else {
      normalized.regular = require( '@megalo/regular-template-compiler' )
    }
  }

  return normalized
}

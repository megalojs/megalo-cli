const qs = require( 'querystring' )
const { compileStyle } = require( '@vue/component-compiler-utils' )
const scoped = require( '../../../postcss-plugins/scoped' )
const tagSelectorTransform = require( '../../../postcss-plugins/tag-selector-transform' )

// This is a post loader that handles scoped CSS transforms.
// Injected right before css-loader by the global pitcher (../pitch.js)
// for any <style scoped> selection requests initiated from within vue files.
module.exports = function (source, inMap) {
  const query = qs.parse(this.resourceQuery.slice(1))
  const postcssPlugins = []

  const isScoped = !!query.scoped
  if ( isScoped ) {
    postcssPlugins.push( scoped( `v-${query.id}` ) )
  }

  postcssPlugins.push( tagSelectorTransform() )

  const { code, map, errors } = compileStyle( {
    source,
    filename: this.resourcePath,
    id: `data-v-${query.id}`,
    map: inMap,
    scoped: false, // disable internal scoped
    trim: true,
    postcssPlugins
  } )

  if ( errors.length ) {
    this.callback( errors[ 0 ] )
  } else {
    this.callback( null, code, map )
  }
}

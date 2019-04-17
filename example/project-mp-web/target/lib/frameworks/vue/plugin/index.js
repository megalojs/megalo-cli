const FrameworkPlugin = require( '../../shared/plugin' )

class VuePlugin {
  constructor( options = {} ) {
    this.options = options
  }

  apply( compiler ) {
    const options = this.options || {}

    new FrameworkPlugin(
      Object.assign( {}, this.options, {
        sfcFiles: [ 'foo.vue', 'foo.vue.html' ],
        pitcherQuery: [ '?vue&' ],
        frameworkLoaderRegexp: /^vue-loader|(\/|\\|@)vue-loader/,
        pitcherLoader: require.resolve( '../loader/pitcher' ),
        compiler: options.compiler.vue,
        entryLoader: require.resolve( '../loader/vue-entry' )
      } )
    ).apply( compiler )
  }
}

module.exports = VuePlugin

const FrameworkPlugin = require( '../../shared/plugin' )

class RegularPlugin {
  constructor( options = {} ) {
    this.options = options
  }

  apply( compiler ) {
    const options = this.options || {}

    new FrameworkPlugin(
      Object.assign( {}, this.options, {
        sfcFiles: [ 'foo.rgl', 'foo.rgl.html' ],
        pitcherQuery: [ '?rgl&' ],
        frameworkLoaderRegexp: /^@megalo\/regular-loader|(\/|\\|@)@megalo\/regular-loader/,
        pitcherLoader: require.resolve( '../loader/pitcher' ),
        compiler: options.compiler.regular,
      } )
    ).apply( compiler )
  }
}

module.exports = RegularPlugin

const path = require( 'path' )
const CopyWebpackPlugin = require( 'copy-webpack-plugin' )
const platforms = require( '../platforms' )

class CopyHtmlparsePlugin {
  constructor( options = {} ) {
    this.options = options
  }

  apply( compiler ) {
    const compilerOptions = compiler.options || {}
    const { output } = compilerOptions
    const htmlParse = this.options.htmlParse
    const platform = this.options.platform

    const extensions = platforms[ platform ] ?
      ( platforms[ platform ].extensions || {} ) :
      platforms.wechat.extensions

    new CopyWebpackPlugin( [
      {
        from: path.resolve( htmlParse.src, `index${ extensions.template }` ),
        to: path.resolve( output.path, 'htmlparse' )
      },
      {
        from: path.resolve( htmlParse.src, `index${ extensions.style }` ),
        to: path.resolve( output.path, 'htmlparse' )
      }
    ] ).apply( compiler )
  }
}

module.exports = CopyHtmlparsePlugin

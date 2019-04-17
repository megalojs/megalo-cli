const webpack = require( 'webpack' )
const normalizeCompiler = require( './utils/normalizeCompiler' )

function createMegaloTarget( options = {} ) {
  options = normalizeOptions( options )

  const { platform = 'wechat', htmlParse } = options

  return function ( compiler ) {
    const FunctionModulePlugin = require( 'webpack/lib/FunctionModulePlugin' )
    const JsonpTemplatePlugin = require( 'webpack/lib/web/JsonpTemplatePlugin' )
    const LoaderTargetPlugin = webpack.LoaderTargetPlugin
    const MegaloPlugin = require( './plugins/MegaloPlugin' )
    const CopyHtmlparsePlugin = require( './plugins/CopyHtmlparsePlugin' )
    const FrameworkPlugins = [
      require( './frameworks/vue/plugin' ),
      require( './frameworks/regular/plugin' )
    ]

    new FunctionModulePlugin().apply( compiler )
    new JsonpTemplatePlugin().apply( compiler )
    new LoaderTargetPlugin( 'mp-' + platform ).apply( compiler )
    new MegaloPlugin( options ).apply( compiler )

    if (platform == 'web') {
      return;
    }

    FrameworkPlugins.forEach( Plugin => new Plugin( options ).apply( compiler ) )

    if ( !!htmlParse ) {
      new CopyHtmlparsePlugin( { htmlParse, platform } ).apply( compiler )
    }
  }
}

function normalizeOptions( options = {} ) {
  return Object.assign( {}, options, {
    compiler: normalizeCompiler( options.compiler || {} )
  } )
}

module.exports = createMegaloTarget

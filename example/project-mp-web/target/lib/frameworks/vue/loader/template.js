const path = require( 'path' )
const qs = require( 'querystring' )
const loaderUtils = require( 'loader-utils' )
const { compileTemplate } = require('@vue/component-compiler-utils')
const removeExtension = require( '../../../utils/removeExtension' )
const getMD5 = require( '../../../utils/md5' )
const extractCompilerOptionsFromScriptSource =
  require( '../../shared/utils/extractCompilerOptionsFromScriptSource' )
const extractPageFromScriptSource =
  require( '../../shared/utils/extractPageFromScriptSource' )
const extractComponentsPlugin = require( '../babel-plugins/extract-components' )
const attachMultiPlatformModule = require('../utils/attachMultiPlatformModule')

// Loader that compiles raw template into JavaScript functions.
// This is injected by the global pitcher (../pitch) for template
// selection requests initiated from vue files.
module.exports = function ( source ) {
  const loaderContext = this
  const callback = loaderContext.async()
  const query = qs.parse(this.resourceQuery.slice(1))

  // although this is not the main vue-loader, we can get access to the same
  // vue-loader options because we've set an ident in the plugin and used that
  // ident to create the request for this loader in the pitcher.
  const options = loaderUtils.getOptions(loaderContext) || {}
  const { id } = query
  const isProduction = loaderContext.minimize || process.env.NODE_ENV === 'production'
  const isFunctional = query.functional

  // allow using custom compiler via options
  const compiler = options.compiler

  const realResourcePath = removeExtension( loaderContext.resourcePath )
  const target = this.target.replace(/^mp-/, '')
  const md5 = getMD5( source.trim() + target )

  const compilerOptions = Object.assign({}, options.compilerOptions, {
    scopeId: query.scoped ? `v-${id}` : null,
    comments: query.comments,
    transformAssetUrls: options.transformAssetUrls || {
      video: ['src', 'poster'],
      source: 'src',
      img: 'src',
      image: 'xlink:href'
    },
    realResourcePath,
    target,
    md5
  })

  // add module to compiler option in order to handle <template platform="xxx">
  attachMultiPlatformModule(compilerOptions);

  const deferred = loaderContext.megaloDeferred( realResourcePath )

  deferred.promise
    .then( data => {
      deferred.del()

      const [ cOptions, page ] = data || []

      validateImports( loaderContext, cOptions.imports )

      loaderContext.megaloCacheToAllCompilerOptions(
        realResourcePath,
        Object.assign( {}, compilerOptions, cOptions ),
      )

      if ( page ) {
        loaderContext.megaloCacheToPages( page )
      }

      loaderContext.megaloCacheToTemplates(
        realResourcePath,
        {
          source,
          useCompiler: 'vue',
        }
      )

      // for vue-component-compiler
      const finalOptions = {
        source,
        filename: this.resourcePath,
        compiler,
        compilerOptions: Object.assign( {}, compilerOptions, {
          imports: cOptions.imports,
        } ),
        // allow customizing behavior of vue-template-es2015-compiler
        transpileOptions: options.transpileOptions,
        transformAssetUrls: options.transformAssetUrls || true,
        isProduction,
        isFunctional,
        optimizeSSR: false
      }

      const compiled = compileTemplate(finalOptions)

      // tips
      if (compiled.tips && compiled.tips.length) {
        compiled.tips.forEach(tip => {
          loaderContext.emitWarning(tip)
        })
      }

      // errors
      if (compiled.errors && compiled.errors.length) {
        loaderContext.emitError(
          `\n  Error compiling template:\n${pad(compiled.source)}\n` +
            compiled.errors.map(e => `  - ${e}`).join('\n') +
            '\n'
        )
      }

      const { code } = compiled

      // finish with ESM exports
      callback( null, code + `\nexport { render, staticRenderFns }` )
    } )
    .catch( e => {
      deferred.del()
      callback( e, source )
    } )
}

function validateImports( loaderContext, imports ) {
  const reg = /\.vue$/

  Object.keys( imports ).forEach( key => {
    const imp = imports[ key ]
    const resolved = imp.resolved
    const context = imp.context

    if ( !reg.test( resolved ) ) {
      loaderContext.emitError( new Error(
        `\nCannot register "${ relativeToCwd( resolved ) }" as vue component ` +
        `from "${ relativeToCwd( context ) }" as it's not a .vue file`
      ) )
    }
  } )
}

function relativeToCwd( filepath ) {
  const cwd = process.cwd()

  return path.relative( cwd, filepath )
}

function pad (source) {
  return source
    .split(/\r?\n/)
    .map(line => `  ${line}`)
    .join('\n')
}

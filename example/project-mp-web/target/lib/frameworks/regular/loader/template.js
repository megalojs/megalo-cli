const qs = require('querystring')
const path = require( 'path' )
const loaderUtils = require('loader-utils')
const { compileTemplate } = require('@vue/component-compiler-utils')
const removeExtension = require( '../../../utils/removeExtension' )
const getMD5 = require( '../../../utils/md5' )
const extractCompilerOptionsFromScriptSource =
  require( '../../shared/utils/extractCompilerOptionsFromScriptSource' )
const extractComponentsPlugin = require( '../babel-plugins/extract-components' )


// Loader that compiles raw template into JavaScript functions.
// This is injected by the global pitcher (../pitch) for template
// selection requests initiated from rgl files.
module.exports = function (data) {
  const source = data.template.content
  const scriptSource = data.script.content

  const loaderContext = this
  const callback = loaderContext.async()
  const query = qs.parse(this.resourceQuery.slice(1))

  // although this is not the main regular-loader, we can get access to the same
  // regular-loader options because we've set an ident in the plugin and used that
  // ident to create the request for this loader in the pitcher.
  const options = loaderUtils.getOptions(loaderContext) || {}
  const { id } = query
  const isProduction = loaderContext.minimize || process.env.NODE_ENV === 'production'
  const filename = this.resourcePath

  const realResourcePath = removeExtension( loaderContext.resourcePath )
  const target = this.target.replace(/^mp-/, '')
  const md5 = getMD5( source.trim() + target )

  // allow using custom compiler via options
  const compiler = options.compiler
  const compilerOptions = Object.assign({}, options.compilerOptions, {
    scopeId: query.scoped ? `r-${id}` : null,
    comments: query.comments,
  })

  extractCompilerOptionsFromScriptSource( scriptSource, extractComponentsPlugin, loaderContext )
    .then( cOptions => {
      loaderContext.megaloCacheToAllCompilerOptions(
        realResourcePath,
        Object.assign( {}, compilerOptions, {
          realResourcePath,
          target,
          md5,
        }, cOptions )
      )

      loaderContext.megaloCacheToTemplates(
        realResourcePath,
        {
          source,
          useCompiler: 'regular',
        }
      )

      const compiled = compiler.compileMP( source, Object.assign(
        {},
        compilerOptions,
        cOptions,
      ) )

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

      callback( null, code + `\nexport { template, expressions }` )
    } )
    .catch( e => {
      callback( e )
    } )
}

function pad (source) {
  return source
    .split(/\r?\n/)
    .map(line => `  ${line}`)
    .join('\n')
}

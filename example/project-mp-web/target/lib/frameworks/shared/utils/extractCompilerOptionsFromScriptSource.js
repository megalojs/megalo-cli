const path = require( 'path' )
const semver = require( 'semver' )
const { babel } = require( '../../../utils/babel' )
const resolveSource = require( '../../../utils/resolveSource' )
const hashify = require( '../../../utils/hashify' )
const removeExtension = require( '../../../utils/removeExtension' )

module.exports = function( source, extractComponentsPlugin, loaderContext ) {
  let realResourcePath = removeExtension( loaderContext.resourcePath )

  const babelOptions = {
    filename: loaderContext.resourcePath,
    plugins: [
      extractComponentsPlugin
    ]
  }

  let metadata

  try {
    metadata = babel.transform( source, babelOptions ).metadata
  } catch ( e ) {
    return Promise.reject( e )
  }

  const components = ( metadata && metadata.megaloComponents ) || {}

  const tmp = {}

  return Promise.all(
    Object.keys( components ).map( key => {
      const source = components[ key ]
      return resolveSource.call( loaderContext, source )
        .then( resolved => {
          const hashed = hashify( resolved )
          tmp[ key ] = {
            name: hashed,
            resolved,
            context: realResourcePath
          }
        } )
    } )
  ).then( () => {
    const compilerOptions = {
      name: hashify( realResourcePath ),
      imports: tmp,
      components: tmp,
    }

    return compilerOptions
  } )
}

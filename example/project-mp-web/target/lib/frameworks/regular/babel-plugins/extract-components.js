module.exports = function ( { types: t } ) {
  return {
    visitor: {
      ExportDefaultDeclaration( path ) {
        const declaration = path.node.declaration

        if ( t.isObjectExpression( declaration ) ) {
          handleObjectExpression( declaration, path )
        } else if ( t.isIdentifier( declaration ) ) {
          const identifierName = declaration.name
          const paths = findRefPaths( identifierName, path.scope.bindings )
          const filtered = paths.filter( path => {
            const parent = path.parent

            return t.isCallExpression( path.parentPath.parent ) &&
              t.isMemberExpression( parent ) &&
              t.isIdentifier( parent.object ) &&
              t.isIdentifier( parent.property ) &&
              parent.object.name === identifierName &&
              parent.property.name === 'component'
          } )

          const components = {}

          filtered.forEach( path => {
            const parent = path.parentPath.parent
            const args = parent.arguments
            if (
              args &&
              args.length > 0 &&
              t.isStringLiteral( args[ 0 ] ) &&
              t.isIdentifier( args[ 1 ] )
            ) {
              const key = args[ 0 ].value
              const value = args[ 1 ].name
              const source = findSource( value, path.scope.bindings )

              if ( !source ) {
                throw new Error( 'cannot find source for ' + value )
              }

              components[ key ] = source
            }
          } )

          path.hub.file.metadata.megaloComponents = components
        }
      },
    },
  }

  function handleObjectExpression( declaration, path ) {
    const componentsProperty = declaration.properties.filter( prop => {
      return t.isObjectProperty( prop ) && t.isIdentifier( prop.key ) &&
        prop.key.name === 'components'
    } )[ 0 ]

    if ( componentsProperty && t.isObjectExpression( componentsProperty.value ) ) {
      const properties = componentsProperty.value.properties
        .filter( prop => t.isObjectProperty( prop ) && t.isIdentifier( prop.value ) )

      const components = {}
      properties.forEach( prop => {
        // prop.key maybe Identifier or StringLiteral
        // Identifier use name, StringLiteral use value
        const key = prop.key.name || prop.key.value
        const value = prop.value.name
        const source = findSource( value, path.scope.bindings )

        if ( !source ) {
          throw new Error( 'cannot find source for ' + key )
        }

        components[ key ] = source
      } )

      path.hub.file.metadata.megaloComponents = components
    }
  }

  function findRefPaths( identifierName, bindings ) {
    const binding = bindings[ identifierName ]

    if ( !binding ) {
      return []
    }

    return binding.referencePaths || []
  }

  function findSource( identifierName, bindings ) {
    const binding = bindings[ identifierName ]
    if ( !binding ) {
      return
    }

    if ( t.isImportDeclaration( binding.path.parent ) ) {
      return binding.path.parent.source.value
    }
  }
}

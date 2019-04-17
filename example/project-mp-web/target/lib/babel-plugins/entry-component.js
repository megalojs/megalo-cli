module.exports = function ( { types: t } ) {
  return {
    visitor: {
      ImportDeclaration( path ) { // for vue
        const bindings = path.scope.bindings
        if (
          t.isStringLiteral( path.node.source ) &&
          path.node.source.value === 'vue' &&
          t.isImportDefaultSpecifier( path.node.specifiers[ 0 ] ) &&
          t.isIdentifier( path.node.specifiers[ 0 ].local )
        ) {
          const vueCtorName = path.node.specifiers[ 0 ].local.name
          if ( bindings[ vueCtorName ] ) {
          	const referencePaths = findRefPaths( vueCtorName, bindings )
            const found = referencePaths.find( p => t.isNewExpression( p.parent ) )
          	const args = found.parent.arguments

            if ( args.length === 1 && t.isIdentifier( args[ 0 ] ) ) {
              const entryComponentCtorName = args[ 0 ].name
              const source = findSource( entryComponentCtorName, bindings )
              path.hub.file.metadata.megaloEntryComponent = source
            }
          }
        }
      },

      Identifier( path ) { // for regular
        const bindings = path.scope.bindings
        const is$inject = path.isIdentifier( { name: '$inject' } )
        const isMemberExpression = t.isMemberExpression( path.parentPath )
        const isCallExpression = t.isCallExpression( path.parentPath.parentPath )

        if ( !bindings ) {
          return
        }

        if ( is$inject && isMemberExpression && isCallExpression ) {
          if ( t.isIdentifier( path.parentPath.node.object ) ) {
            const identifier = path.parentPath.node.object
            const identifierName = identifier.name

            const declaration = bindings[ identifierName ]
            if ( t.isVariableDeclarator( declaration.path.node ) ) {
              const node = declaration.path.node
              if ( t.isIdentifier( node.init.callee ) ) {
                const ctorName = node.init.callee.name

                path.hub.file.metadata.megaloEntryComponent = findSource( ctorName, bindings )
              }
            }
          }
        }
      },
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

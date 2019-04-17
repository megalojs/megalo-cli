module.exports = function ( type ) {
  return function ( { types: t } ) {
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
                const decl = found.findParent( path => path.isVariableDeclaration() )

                if ( !decl ) {
                  return
                }

                const assignment = t.expressionStatement(
                  t.assignmentExpression(
                    '=',
                    t.memberExpression(
                      t.identifier( entryComponentCtorName ),
                      t.identifier( 'mpType' ),
                    ),
                    t.stringLiteral( type )
                  )
                )

                decl.insertBefore( assignment )
              }
            }
          }
        },

      }
    }
  }
}

function findRefPaths( identifierName, bindings ) {
  const binding = bindings[ identifierName ]

  if ( !binding ) {
    return []
  }

  return binding.referencePaths || []
}

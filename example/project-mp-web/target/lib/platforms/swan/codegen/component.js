module.exports = function ( { source, compiler, compilerOptions } ) {
  const { imports } = compilerOptions

  if (imports) {
    Object.keys(imports).forEach( key => {
      const { src } = imports[key]
      if ( !/.swan$/.test( src ) ) {
        imports[key].src = `${src}.swan`
      }
    } )
  }

  return compiler.compileToTemplate(
    source,
    compilerOptions
  )
}

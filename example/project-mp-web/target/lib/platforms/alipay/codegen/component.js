module.exports = function ( { source, compiler, compilerOptions } ) {
  return compiler.compileToTemplate(
    source,
    compilerOptions
  )
}

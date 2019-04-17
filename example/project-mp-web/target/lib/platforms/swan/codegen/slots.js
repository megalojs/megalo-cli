module.exports = function ( { imports, bodies } ) {
  let slotsOutput = ''
  imports.forEach( im => {
    slotsOutput = slotsOutput + `<import src="${ im }" />\n`
  } )

  slotsOutput = slotsOutput + `\n`

  bodies.forEach( b => {
    slotsOutput = slotsOutput + b + `\n\n`
  } )

  return slotsOutput
}

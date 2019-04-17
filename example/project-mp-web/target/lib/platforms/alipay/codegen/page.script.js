const relativeToRoot = require( '../../shared/utils/relativeToRoot' )

const fixGlobalSnippet = `
if (!my.__megalo) {
  my.__megalo = {
    App: App,
  }
}
`

module.exports = function ( { file, files = {} } = {} ) {
  const split = files.split.js || []
  const main = files.main.js || []
  const res = split
    .concat( main )
    .map( j => `require('${ relativeToRoot( file ) }${ j }')` )
  
  res.unshift(fixGlobalSnippet)
  return res.join( '\n' )
}

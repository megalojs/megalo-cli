// modify this file together with findAllRulesByFile.js as it is copied from this one
const RuleSet = require( 'webpack/lib/RuleSet' )

module.exports = function findRuleIndexByFile( rules, fakes ) {
  let index

  fakes.some( fake => {
    const ruleIndex = rules.findIndex( createMatcher( fake ) )

    if ( ~ruleIndex ) {
      index = ruleIndex
      return true
    }

    return false
  } )

  return rules[ index ]
}

function createMatcher ( fake ) {
  const queryIndex = fake.indexOf( '?' )
  let resourcePath
  let resourceQuery

  if ( ~queryIndex ) {
    resourcePath = fake.substr( 0, queryIndex )
    resourceQuery = fake.substr( queryIndex )
  } else {
    resourcePath = fake
    resourceQuery = '?'
  }

  return ( rule, i ) => {
    // we need to skip the `include` check when locating the vue rule
    const clone = Object.assign({}, rule)
    delete clone.include
    const normalized = RuleSet.normalizeRule(clone, {}, '')

    return (
      !rule.enforce &&
      normalized.resource &&
      normalized.resource(resourcePath) &&
      ( normalized.resourceQuery ? normalized.resourceQuery( resourceQuery ) : true )
    )
  }
}

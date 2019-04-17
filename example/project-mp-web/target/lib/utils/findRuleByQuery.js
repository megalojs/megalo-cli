const RuleSet = require( 'webpack/lib/RuleSet' )

module.exports = function findRuleIndexByQuery( rules, fakeQueries ) {
  let index

  fakeQueries.some( fakeQuery => {
    const ruleIndex = rules.findIndex( createMatcher( fakeQuery ) )

    if ( ~ruleIndex ) {
      index = ruleIndex
      return true
    }

    return false
  } )

  return rules[ index ]
}

function createMatcher ( fakeQuery ) {
  return ( rule, i ) => {
    // we need to skip the `include` check when locating the vue rule
    const clone = Object.assign({}, rule)
    delete clone.include
    const normalized = RuleSet.normalizeRule(clone, {}, '')

    return (
      !rule.enforce &&
      normalized.resourceQuery &&
      normalized.resourceQuery( fakeQuery )
    )
  }
}

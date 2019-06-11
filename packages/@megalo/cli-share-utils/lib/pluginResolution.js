const pluginRE = /^(@megalo\/|megalo-|@[\w-]+\/megalo-)cli-plugin-/
const scopeRE = /^@[\w-]+\//
const officialRE = /^@megalo\//

exports.isPlugin = id => pluginRE.test(id)

exports.isOfficialPlugin = id => exports.isPlugin(id) && officialRE.test(id)

exports.toShortPluginId = id => id.replace(pluginRE, '')

exports.resolvePluginId = id => {
  // already full id
  // e.g. megalo-cli-plugin-foo, @megalo/cli-plugin-foo, @bar/megalo-cli-plugin-foo
  if (pluginRE.test(id)) {
    return id
  }
  // scoped short
  // e.g. @megalo/foo, @bar/foo
  if (id.charAt(0) === '@') {
    const scopeMatch = id.match(scopeRE)
    if (scopeMatch) {
      const scope = scopeMatch[0]
      const shortId = id.replace(scopeRE, '')
      return `${scope}${scope === '@megalo/' ? `` : `megalo-`}cli-plugin-${shortId}`
    }
  }
  // default short
  // e.g. foo
  return `megalo-cli-plugin-${id}`
}

exports.matchesPluginId = (input, full) => {
  const short = full.replace(pluginRE, '')
  return (
    // input is full
    full === input ||
    // input is short without scope
    short === input ||
    // input is short with scope
    short === input.replace(scopeRE, '')
  )
}

exports.getPluginLink = id => {
  if (officialRE.test(id)) {
    return `https://github.com/megalo/megalo-cli/tree/dev/packages/%40megalo/cli-plugin-${
      exports.toShortPluginId(id)
    }`
  }
  let pkg = {}
  try {
    pkg = require(`${id}/package.json`)
  } catch (e) {}
  return (
    pkg.homepage ||
    (pkg.repository && pkg.repository.url) ||
    `https://www.npmjs.com/package/${id.replace(`/`, `%2F`)}`
  )
}

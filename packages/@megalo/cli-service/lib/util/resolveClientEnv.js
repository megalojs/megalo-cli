const prefixRE = /^VUE_APP_/
const systemEnvWhiteList = ['NODE_ENV', 'PLATFORM']

module.exports = function resolveClientEnv () {
  const env = {}
  Object.keys(process.env).forEach(key => {
    if (prefixRE.test(key) || systemEnvWhiteList.includes(key)) {
      env[key] = process.env[key]
    }
  })
  return env
}

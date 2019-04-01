const prefixRE = /^VUE_APP_/
const systemEnvWhiteList = ['NODE_ENV', 'PLATFORM']

module.exports = function resolveClientEnv (raw = false) {
  const env = {}
  Object.keys(process.env).forEach(key => {
    if (prefixRE.test(key) || systemEnvWhiteList.includes(key)) {
      env[key] = process.env[key]
    }
  })

  if (raw) {
    return env
  }

  for (const key in env) {
    env[key] = JSON.stringify(env[key])
  }
  return {
    'process.env': env
  }
}

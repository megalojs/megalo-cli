module.exports = function stringifyLoader( loader ) {
  return typeof loader === 'string' ? loader : loader.request
}

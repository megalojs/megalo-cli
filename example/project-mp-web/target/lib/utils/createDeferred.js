module.exports = function () {
  const p = {}

  p.promise = new Promise( ( resolve, reject ) => {
    p.resolve = resolve
    p.reject = reject
  } )

  return p
}

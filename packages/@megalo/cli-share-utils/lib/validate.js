const { exit } = require('./exit')

// proxy to joi for option validation
exports.createSchema = fn => fn(require('joi'))

exports.validate = (obj, schema, cb) => {
  require('joi').validate(obj, schema, {}, err => {
    if (err) {
      cb(err.message)
      exit(1)
    }
  })
}

exports.validateSync = (obj, schema) => {
  const result = require('joi').validate(obj, schema)
  if (result.error) {
    throw result.error
  }
}

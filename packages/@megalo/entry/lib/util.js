const fs = require('fs')
const path = require('path')

const extractConfigPlugin = require('./extract-config')
const babel = require('babel-core')

const babelOptions = {
  plugins: [
    extractConfigPlugin
  ]
}

function resolve (...args) {
  return path.resolve(__dirname, '../', ...args)
}

function extractConfig (txt) {
  const { metadata } = babel.transform(txt, babelOptions)
  return metadata.config.value
}

function getAppObj (file) {
  const txt = fs.readFileSync(file, 'utf8')
  return extractConfig(txt)
}

module.exports = {
  resolve,
  getAppObj,
  extractConfig
}

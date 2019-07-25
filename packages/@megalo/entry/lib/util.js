const fs = require('fs')
const path = require('path')
const parseConfig = require('./parseConfig')

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

function extractConfigFromSFC (txt, filepath = '') {
  const block = txt.match(/<config\b[^>]*>([\s\S]*)<\/config>/)
  if (!block) return {}
  let lang = block[0].match(/<config .*?lang=\"(.+?)\"/)
  lang = (lang && lang[1]) || 'json'
  return parseConfig({ source: block[1], lang, filepath })
}

function getAppObj (file) {
  const txt = fs.readFileSync(file, 'utf8')
  return file.endsWith('.vue') ? extractConfigFromSFC(txt) : extractConfig(txt)
}

module.exports = {
  resolve,
  getAppObj,
  extractConfig,
  extractConfigFromSFC
}

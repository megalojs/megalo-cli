const json = require( './codegen/page.json' )
const script = require( './codegen/page.script' )
const style = require( './codegen/page.style' )
const template = require( './codegen/page.template' )
const component = require( './codegen/component' )
const slots = require( './codegen/slots' )

const createCodegenFn = require('../shared')

const extensions = {
  json: '.json',
  script: '.js',
  style: '.acss',
  template: '.axml',
}

exports.codegen = createCodegenFn( {
  generators: {
    json,
    script,
    style,
    template,
    component,
    slots,
  },
  extensions
} )

exports.extensions = extensions

const fs = require('fs')
const path = require('path')
const json5 = require('json5')

const exp4parse = /\/\*[^*]*\*+(?:[^\/*][^*]*\*+)*\/|\/\/[^\r\n]*|\s/g

function resolve (...args) {
  return path.resolve(__dirname, '../', ...args)
}

function walk4Obj (txt, startStr) {
  if (typeof txt !== 'string' || typeof startStr !== 'string') {
    return console.log('Props error')
  }
  const index = txt.indexOf(startStr)

  let resault = {}

  const begin = index + startStr.length

  let end = begin

  try {
    if (index > 0) {
      for (let _i = begin, _l = txt.length, _a = 0; _i < _l; _i++) {
        switch (txt.charAt(_i) || '') {
        case '{': _a++
          break
        case '}': _a--
          break
        default : break
        }
        if (_a <= 0) {
          end = _i
          break
        }
      }
      resault = json5.parse(txt.substring(begin, end + 1))
    }
  } catch (e) {
    console.log(e)
  }
  return resault
}

function getAppObj (file) {
  let txt = fs.readFileSync(file, 'utf8')
  txt = txt.replace(exp4parse, '')
  return walk4Obj(txt, 'exportdefault')['config'] || {}
}

module.exports = {
  resolve,
  walk4Obj,
  getAppObj
}

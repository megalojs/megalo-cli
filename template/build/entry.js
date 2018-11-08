'use strict'
const fs = require('fs')
const path = require( 'path' )
const json5 = require('json5')
const exp4parse = /\/\*[^*]*\*+(?:[^\/*][^*]*\*+)*\/|\/\/[^\r\n]*|\s/g
const exp4filter = /(?:exportdefault[\S\s]*)pages:(\[[^\[\]]*\])/

// 获取指定目录下符合glob的所有文件
function getEntry(file) {
    let entries = {},
        txt = '',
        pages

    try {
        txt = fs.readFileSync(file,'utf8')
        txt = txt.replace(exp4parse,'')
        
        pages = json5.parse(txt.match(exp4filter)[1]) || []
        pages.forEach(p=>{
            entries[p] = path.resolve(`src/${p}.js`)
        })
    } catch (e) {
        console.log(e)
    }

    return entries
}

module.exports = (() => {
    let entry = {}
    entry = getEntry(path.resolve( __dirname, '../src/index.js'))
    return entry
})()
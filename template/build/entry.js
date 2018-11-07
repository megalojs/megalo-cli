'use strict'
const glob = require('glob')
const path = require('path')

// 获取指定目录下符合glob的所有文件
function getEntry(...globPath) {
    var files = [];
    globPath.forEach((path) => {
        var pages = glob.sync(path)
        pages.forEach((page) => {
            files.push(page)
        })
    })

    var entries = {},
        pageName;

    files.forEach((entry) => {
        pageName = entry.match(/([^\/.]*\/pages\/[^\/.]*\/index)\.js$/)[1];
        if (pageName.startsWith('src')) {
            pageName = pageName.replace('src/', '')
        }
        entries[pageName] = path.resolve(entry);
    })
    return entries;
}

module.exports = (() => {
    let entry = {}
    let paths = [
        path.resolve(__dirname, '../src/pages/*/index.js'),
        path.resolve(__dirname, '../src/*/pages/*/index.js')
    ]
    entry = getEntry(...paths);
    return entry
})()
'use strict'
const path = require('path')
const { getAppObj } = require('../util')
const fs = require('fs')

const matchPath = function (p) {
  const files = [path.resolve(`src/${p}.js`), path.resolve(`src/${p}.vue`)]
  return fs.existsSync(files[0]) && files[0] || fs.existsSync(files[1]) && files[1]
}

// 获取指定目录下符合glob的所有文件
module.exports = function (file, whileList = []) {
  let entries = {}

  let mainObj = {}

  let pages

  let subpackages

  let homeKey

  try {
    mainObj = getAppObj(file) || {}
    pages = mainObj.pages || []
    subpackages = mainObj.subpackages || mainObj.subPackages || []

    pages.forEach(p => {
      if (p.startsWith('^')) {
        p = p.replace(/^\^+/, '')
        homeKey = p
      }
      matchPath(p) && (entries[p] = matchPath(p))
    })
    subpackages.forEach(sp => {
      const { root, pages } = sp
      if (root && pages.length > 0) {
        pages.forEach(p => {
          if (p.startsWith('^')) {
            p = p.replace(/^\^+/, '')
            homeKey = p
          }
          matchPath(`${root}/${p}`) && (entries[`${root}/${p}`] = matchPath(`${root}/${p}`))
        })
      }
    })

    // 白名单筛选
    if (whileList.length > 0) {
      for (const p in entries) {
        whileList.indexOf(p) === -1 && (delete entries[p])
      }
    }
  } catch (e) {
    console.log(e)
  }

  // 将主页排序到最前面(这里的排序对生成小程序app.json页面先后顺序是没有任何作用的，取决于@megalo/target那边的修改)
  entries = Object.fromEntries(Object.entries(entries).sort((a, b) => {
    return (b[0] === homeKey) - (a[0] === homeKey)
  }))

  return entries
}

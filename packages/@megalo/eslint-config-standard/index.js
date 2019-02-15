// http://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    // https://github.com/standard/standard/blob/master/docs/README-zhcn.md
    'standard'
  ],
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },
  globals: {
    App: true,
    Page: true,
    Component: true,
    getApp: true,
    getCurrentPages: true,
    requirePlugin: true,
    wx: true,
    my: true,
    swan: true,
    Megalo: true
  }
}

// http://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    // https://github.com/airbnb/javascript
    'airbnb-base'
  ],
  settings: {
    'import/resolver': {
      webpack: {
        // TODO
        config: require.resolve(`@megalo/cli-service/lib/webpack.base.conf.js`)
      }
    }
  },
  rules: {
    'import/extensions': ['error', 'always', {
      js: 'never',
      mjs: 'never',
      jsx: 'never',
      ts: 'never',
      tsx: 'never'
    }],
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

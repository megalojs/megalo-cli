module.exports = function () {
  // TODO 根据platform，分别输出真对小程序和h5的配置
  const presets = [
    ['@babel/preset-env', {
      'targets': {
        'browsers': [
          'Android >= 4',
          'iOS >= 10'
        ]
      }
    }],
    ['@babel/preset-typescript', { allExtensions: true }]
  ]
  const plugins = [
    [
      '@babel/plugin-transform-runtime',
      {
        'helpers': false,
        'regenerator': true
      }
    ],
    [
      '@babel/plugin-proposal-decorators',
      { 'legacy': true }
    ],
    ['@babel/plugin-proposal-class-properties',
      { 'loose': true }
    ]
  ]

  return {
    presets,
    plugins
  }
}

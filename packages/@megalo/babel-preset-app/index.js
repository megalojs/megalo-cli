const path = require('path')
const fs = require('fs')
const isUseTypescript = fs.existsSync(path.join(process.env.MEGALO_CLI_CONTEXT, 'tsconfig.json'))
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
    }]
  ]
  const plugins = [
    [
      '@babel/plugin-transform-runtime',
      {
        'helpers': false,
        'regenerator': true
      }
    ]
  ]

  if (isUseTypescript) {
    // 暂时用ts-loader 来替换
    // presets.push(['@babel/preset-typescript', { allExtensions: true }])
    plugins.push(
      [
        '@babel/plugin-proposal-decorators',
        { 'legacy': true }
      ],
      ['@babel/plugin-proposal-class-properties',
        { 'loose': true }
      ]
    )
  }

  return {
    presets,
    plugins
  }
}

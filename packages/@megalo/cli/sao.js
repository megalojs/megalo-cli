const isEmail = require('is-email')

module.exports = {
  prompts: {
    projectName: {
      message: 'project name? (eg. my-megalo-project)',
      default: ':folderName:'
    },
    description: {
      message: 'description',
      default: 'a megalo project'
    },
    author: {
      message: 'author',
      default: ':gitUser:',
      store: true
    },
    email: {
      message: 'email',
      default: ':gitEmail:',
      store: true,
      validate: val => (isEmail(val) ? true : 'Invalid email')
    },
    cssPreset: {
      message: 'Choose CSS Pre-processors',
      type: 'list',
      choices: ['sass', 'less', 'stylus']
    },
    needPx2Rpx: {
      message: 'Need px2rpx loader?',
      type: 'list',
      choices: ['Yes', 'No']
    },
    needMegaloAPI: {
      message: 'Need megalo api',
      type: 'list',
      choices: ['No', 'Yes']
    },
    needEslint: {
      message: 'Need eslint to check and format code',
      type: 'list',
      choices: ['Yes', 'No']
    }
  },
  move: {
    'gitignore': '.gitignore',
    README: 'README.md',
    package: 'package.json'
  },
  skipInterpolation: [],
  showTip: true,
  gitInit: false,
  installDependencies: true
}

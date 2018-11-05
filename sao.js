const isEmail = require('is-email');

module.exports = {
  prompts: {
    projectName: {
      message: '你的工程叫什么名字？（如 kaola-ksvue-fed）',
      default: ':folderName:'
    },
    description: {
      message: '项目介绍',
      default: 'a vue ssr project'
    },
    author: {
      message: "开发者",
      default: ':gitUser:',
      store: true
    },
    email: {
      message: "邮箱地址",
      default: ':gitEmail:',
      store: true,
      validate: val => (isEmail(val) ? true : 'Invalid email')
    },
    cookieSecurityKeys: {
      message: 'cookie security keys',
      default: `${Date.now()}_${Math.floor(Math.random()*8999)+1000}`
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
  installDependencies: false
}

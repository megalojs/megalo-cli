const isEmail = require('is-email');

module.exports = {
  prompts: {
    projectName: {
      message: '你的工程叫什么名字？（如 my-megalo-wechat）',
      default: ':folderName:'
    },
    description: {
      message: '项目介绍',
      default: 'a megalo project'
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

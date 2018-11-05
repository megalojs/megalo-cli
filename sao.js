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
    },
    serverPort: {
      message: '你的工程需想跑在什么端口上？',
      default: '3000'
    },
    serverApplication: {
      message: '后端 Web 服务的应用名是什么？',
      default: 'ksvue-server-web'
    },
    needStore: {
      message: '是否使用 Vuex?(Y/N)',
      default: 'Yes',
      validate: val => (/^(yes|no|y|n|true|false)$/i.test(val) ? true : false),
      filter: val => /^(yes|y|true)$/i.test(val)? true : false
    }
  },
  move: {
    'gitignore': '.gitignore',
    README: 'README.md',
    package: 'package.json'
  },
  skipInterpolation: [
    '**/router-template.tpl'
  ],
  showTip: true,
  gitInit: false,
  installDependencies: false
}

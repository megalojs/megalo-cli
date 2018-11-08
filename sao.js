const isEmail = require('is-email');

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
      message: "author",
      default: ':gitUser:',
      store: true
    },
    email: {
      message: "email",
      default: ':gitEmail:',
      store: true,
      validate: val => (isEmail(val) ? true : 'Invalid email')
    },
    cssPreset: {
      message: "CSS extension language",
      type: 'list',
      choices: ['sass', 'less', 'stylus']
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

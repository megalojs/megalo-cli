const isEmail = require('is-email')

module.exports = {
  prompts () {
    return [
      {
        name: 'projectName',
        message: 'project name? (eg. my-megalo-project)',
        default: this.outFolder
      },
      {
        name: 'description',
        message: 'description',
        default: 'a megalo project'
      },
      {
        name: 'author',
        message: 'author',
        default: this.gitUser.username || this.gitUser.name,
        store: true
      },
      {
        name: 'email',
        message: 'email',
        default: this.gitUser.email,
        store: true,
        validate: val => (isEmail(val) ? true : 'Invalid email')
      },
      {
        name: 'cssPreset',
        message: 'Choose CSS Pre-processors',
        type: 'list',
        choices: ['sass', 'less', 'stylus']
      },
      {
        name: 'needPx2Rpx',
        message: 'Need px2rpx loader?',
        type: 'list',
        choices: ['Yes', 'No']
      },
      {
        name: 'needMegaloAPI',
        message: 'Need megalo api',
        type: 'list',
        choices: ['No', 'Yes']
      },
      {
        name: 'needEslint',
        message: 'Need eslint to check and format code',
        type: 'list',
        choices: ['Yes', 'No']
      }
    ]
  },
  actions: [
    {
      type: 'add',
      // Copy and transform all files in `template` folder into output directory
      files: '**'
    },
    {
      type: 'move',
      patterns: {
        'gitignore': '.gitignore',
        'README': 'README.md',
        'package': 'package.json'
      }
    }
  ],
  async completed () {
    await this.npmInstall()
    this.showProjectTips()
  }
  // skipInterpolation: [],
  // showTip: true,
  // gitInit: false,
  // installDependencies: true
}

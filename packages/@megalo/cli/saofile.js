const isEmail = require('is-email')
const path = require('path')

module.exports = {
  prompts () {
    return [
      {
        name: 'projectName',
        message: 'project name (eg. my-megalo-project)',
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
        choices: [
          {
            name: 'sass/scss',
            value: 'scss'
          },
          'less', 'stylus']
      },
      {
        name: 'needPx2Rpx',
        message: 'Need px2rpx loader',
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
  actions () {
    const { needEslint } = this.answers
    return [
      {
        type: 'add',
        files: '**',
        filters: {
          'eslint*': needEslint === 'Yes'
        }
      },
      {
        type: 'move',
        patterns: {
          'gitignore': '.gitignore',
          'README': 'README.md',
          'package': 'package.json',
          'eslintignore': '.eslintignore',
          'eslintrc': '.eslintrc.js'
        }
      }
    ]
  },
  async completed () {
    await this.npmInstall()
    this.showProjectTips()
    const logCd = () => {
      if (this.outDir !== process.cwd()) {
        console.log(
          `${this.chalk.bold('cd')} ${this.chalk.cyan(
            path.relative(process.cwd(), this.outDir)
          )}`
        )
      }
    }

    this.logger.tip(`To start dev server, run following commands:`)
    logCd()
    console.log(
      `${this.chalk.cyan('npm run dev:wechat')}`
    )

    this.logger.tip(`To build for production, run following commands:`)
    logCd()
    console.log(
      `${this.chalk.cyan('npm run build:wechat')}`
    )
  }
}

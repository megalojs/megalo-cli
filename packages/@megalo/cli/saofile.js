const path = require('path')

module.exports = {
  prompts () {
    return [
      {
        name: 'features',
        message: 'Check the features needed for your project:',
        type: 'checkbox',
        default: ['css-pre-processors', 'eslint'],
        choices: [
          {
            name: 'Typescript',
            value: 'typescript'
          },
          {
            name: 'CSS Pre-processors',
            value: 'css-pre-processors'
          },
          {
            name: 'Eslint',
            value: 'eslint'
          },
          {
            name: 'Vuex',
            value: 'vuex'
          }
        ]
      },
      {
        name: 'cssPreset',
        message: 'Choose CSS Pre-processors',
        type: 'list',
        choices: [
          {
            name: 'Sass/SCSS',
            value: 'scss'
          },
          {
            name: 'Less',
            value: 'less'
          },
          {
            name: 'Stylus',
            value: 'stylus'
          }
        ]
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
  templateData() {
    return {
      projectName: this.outFolder
    }
  },
  actions () {
    const { needEslint, features } = this.answers
    return [
      {
        type: 'add',
        templateDir: 'templates/main',
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

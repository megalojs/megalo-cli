const chalk = require('chalk')

module.exports = () => {
  const h_m = `
Usage: ${chalk.green('megalo')} <app-name> [options]

Options:
    -v, --version           output the version number
    -h, --help              output usage information
    -f, --force             enforce command, ignore the new version

For more https://github.com/kaola-fed/megalo-cli
    `
  console.log(h_m)
  return true
}

const chalk = require('chalk')
const compareVersions = require('compare-versions')
const banner = `
███╗   ███╗███████╗ ██████╗  █████╗ ██╗      ██████╗ 
████╗ ████║██╔════╝██╔════╝ ██╔══██╗██║     ██╔═══██╗
██╔████╔██║█████╗  ██║  ███╗███████║██║     ██║   ██║
██║╚██╔╝██║██╔══╝  ██║   ██║██╔══██║██║     ██║   ██║
██║ ╚═╝ ██║███████╗╚██████╔╝██║  ██║███████╗╚██████╔╝
╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝ ╚═════╝  `

module.exports = (localVersion='0', latestVersion='0', showVersion=false)=> {
    let hasNewVersion, _v_m, _nv_m

    hasNewVersion = compareVersions(latestVersion, localVersion) > 0
    _v_m = `
-----------------------------------------------------
    current version:    ${localVersion}
-----------------------------------------------------
    `
    _nv_m = `
-----------------------------------------------------
    current version:    ${localVersion}    
    has new version:    ${chalk.green(latestVersion)}
    megalo suggest you update it before building.
    ${chalk.yellow('npm i -g @megalo/cli@latest')}
    or you can use option -f to enforce the command.
-----------------------------------------------------
-   Run megalo -h for detailed usage.
    `
    console.log(chalk.green(banner))
    hasNewVersion ? console.log(_nv_m) : showVersion && console.log(_v_m)
    return hasNewVersion
}
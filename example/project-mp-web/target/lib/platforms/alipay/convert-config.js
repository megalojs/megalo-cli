const renamePorps = require( '../shared/utils/renameProps' )

const APP_ROOT_NAME_MAP = {
  subPackages: 'subpackages'
}

// app window 和 page 配置项
const APP_WINDOW_NAME_MAP = {
  navigationBarTitleText: 'defaultTitle',
  navigationBarBackgroundColor: 'titleBarColor',
  enablePullDownRefresh: 'pullRefresh'
}

const APP_TAB_BAR_NAME_MAP = {
  color: 'textColor',
  list: 'items'
}

const APP_TAB_BAR_ITEM_NAME_MAP = {
  text: 'name',
  iconPath: 'icon',
  selectedIconPath: 'activeIcon'
}

function extractPagesFromSubpackages( subpackages = [] ) {
  return subpackages.reduce( (res, sub) => {
    const pages = sub.pages.forEach( page => {
      res.push(`${sub.root}/${page}`)
    } )
    return res
  }, [] )
}

function convertAppConfig( config ) {
  const converted = renamePorps( config, APP_ROOT_NAME_MAP ) 
  const { window, tabBar, subpackages, pages } = converted
  if (window) {
    converted.window = renamePorps( window, APP_WINDOW_NAME_MAP )
  }
  if (tabBar) {
    converted.tabBar = renamePorps( tabBar, APP_TAB_BAR_NAME_MAP )
    converted.tabBar.items = converted.tabBar.items.map( e => renamePorps( e, APP_TAB_BAR_ITEM_NAME_MAP ) )
  }
  if (subpackages) {
    converted.pages = pages.concat( extractPagesFromSubpackages( subpackages ) )
    delete converted.subpackages
  }
  
  return converted
}

function convertPageConfig( config ) {
  const converted = renamePorps( config, APP_WINDOW_NAME_MAP )
  return converted
}

module.exports.convertAppConfig = convertAppConfig
module.exports.convertPageConfig = convertPageConfig
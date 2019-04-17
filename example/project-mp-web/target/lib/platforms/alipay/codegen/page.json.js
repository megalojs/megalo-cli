const composePlatformConfig = require( '../../shared/utils/composePlatformConfig' )
const {
  convertAppConfig,
  convertPageConfig
} = require( '../convert-config' )

module.exports = function ( { config = {}, file } ) {
  const _config = composePlatformConfig( config, 'alipay' )
  let converted = {}
  if (file === 'app') {
    converted = convertAppConfig( _config )
  } else {
    converted = convertPageConfig( _config )
  }
  return JSON.stringify( converted, 0, 2 )
}

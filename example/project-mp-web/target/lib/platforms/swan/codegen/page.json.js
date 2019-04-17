const composePlatformConfig = require( '../../shared/utils/composePlatformConfig' )

module.exports = function ( { config = {} } ) {
  const _config = composePlatformConfig( config, 'swan' )
  return JSON.stringify( _config, 0, 2 )
}

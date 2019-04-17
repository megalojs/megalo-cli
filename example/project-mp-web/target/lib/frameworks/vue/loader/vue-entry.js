const qs = require( 'querystring' )

module.exports = source => source

module.exports.pitch = function ( remainingRequest ) {
  const loaderContext = this
  const query = qs.parse( loaderContext.resourceQuery.slice( 1 ) )
  const entryHelper = loaderContext.megaloEntryHelper

  // handle *.[framework] as entry
  if ( entryHelper.isEntry( loaderContext.resourcePath ) ) {
    const entryKey = entryHelper.getEntryKey( loaderContext.resourcePath )

    // only pitch in first time
    if ( typeof query.vue === 'undefined' ) {
      return `
        import Component from ${ JSON.stringify( '-!' + remainingRequest ) };
        import Vue from 'vue';
        Component.mpType = "${ entryKey === 'app' ? 'app' : 'page' }";
        new Vue(Component).$mount();
      `
    }
  }
}

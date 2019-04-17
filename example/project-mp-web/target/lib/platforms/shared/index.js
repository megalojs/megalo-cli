const emitFile = require( '../../utils/emitFile' )
const relativeToRoot = require( './utils/relativeToRoot' )
const getMD5 = require( '../../utils/md5' )
const hash = require( 'hash-sum' )
const constants = require( './constants' )
const subpackagesUtil = require( '../../utils/subpackages' )
const emitError = require( './utils/emitError' )

const DEFAULT_IMPORT_GENERATORS = {
  'import': {
    template: require( './codegen/import.template.js' ),
    style: require( './codegen/import.style.js' ),
  }
}

const _caches = {}

module.exports = function( {
  generators,
  extensions,
} ) {
  return function(
    pages = [],
    { subpackages, templates, allCompilerOptions, megaloTemplateCompiler, megaloOptions } = {},
    { compiler, compilation } = {}
  ) {
    const { htmlParse = false, platform } = megaloOptions

    const htmlParsePaths = {
      template: constants.HTMLPARSE_TEMPLATE_OUTPUT_PATH + extensions.template,
      style: constants.HTMLPARSE_STYLE_OUTPUT_PATH + extensions.style,
    }

    generators = Object.assign( {}, DEFAULT_IMPORT_GENERATORS, generators )

    // emit page template / style / script / json
    pages.forEach( options => {
      const { file } = options

      const generatorOptions = normalizeGeneratorOptions(
        Object.assign( {}, options, { htmlParse, htmlParsePaths } ),
        { constants, extensions }
      )

      ;[ 'json', 'script', 'style', 'template' ].forEach( type => {
        const generated = generators[ type ]( generatorOptions )
        const outPath = `${ file }${ extensions[ type ] }`

        emitFile( outPath, generated, compilation )
      } )
    } )

    const components = []

    // prepare for generate components and slots
    Object.keys( templates ).forEach( resourcePath => {
      const { source, useCompiler } = templates[ resourcePath ]
      const compilerOptions = allCompilerOptions[ resourcePath ] || {}
      const name = compilerOptions.name
      const imports = compilerOptions.imports
      const subpackage = subpackagesUtil.findSubpackage(
        resourcePath, subpackages
      )

      const md5 = hash( { source, imports } )
      let cached = _caches[ resourcePath ] || {}

      // changed
      if ( cached.md5 !== md5 ) {
        let compiler = megaloTemplateCompiler[ useCompiler ] ||
          megaloTemplateCompiler.vue

        const generated = generators.component( {
          source,
          compiler,
          compilerOptions: Object.assign(
            {},
            compilerOptions,
            { target: platform, imports, htmlParse }
          ),
        } )

        cached = _caches[ resourcePath ] = {
          md5,
          body: generated.body || '',
          slots: generated.slots || [],
          needHtmlParse: !!generated.needHtmlParse,
          children: generated.children,
        }
      }

      components.push( {
        resourcePath,
        subpackage,
        name,
        imports,
        body: cached.body,
        slots: cached.slots,
        needHtmlParse: cached.needHtmlParse,
        children: cached.children,
      } )
    } )

    // default hoisted components
    const HOISTED_COMPONENT_NAMES = new Set(
      components
        .filter( c => !c.subpackage )
        .map( c => c.name )
    )

    const mainSlots = new Set()
    const subpackageSlots = {}

    // Start: find hoisted components
    components.forEach( component => attachParent( component.children ) )

    function attachParent( children ) {
      if ( Array.isArray( children ) ) {
        walkChildren( children, null, ( child, parent ) => {
          child.parent = parent
        } )
      }
    }

    let ttl = 20
    let dirty = false

    function digest() {
      dirty = false

      components.forEach( component => {
        const { children } = component

        walkChildren( children, null, child => {
          // not hoisted yet, start checking
          if ( !isHoisted( child.name ) ) {
            traverseUp( child, parent => {
              if ( parent && isHoisted( parent.name ) ) {
                hoist( child.name )
                dirty = true
                return false
              }
            } )
          }
        } )
      } )

      ttl--

      if ( dirty && ttl > 0 ) {
        digest()
      }
    }

    digest()

    function isHoisted( name ) {
      return HOISTED_COMPONENT_NAMES.has( name )
    }

    function hoist( name ) {
      HOISTED_COMPONENT_NAMES.add( name )
    }

    function traverseUp( child, callback ) {
      let target = child.parent
      while ( target ) {
        if ( callback( target ) === false ) {
          break
        }
        target = target.parent
      }
    }

    function walkChildren( children = [], parent, callback ) {
      children.forEach( child => {
        callback( child, parent )

        if ( child.children ) {
          walkChildren( child.children, child, callback )
        }
      } )
    }
    // END: find hoisted components

    // Start: find hoisted slots
    components.forEach( component => {
      const { subpackage, children } = component

      const root = subpackage ? subpackage.root + '/' : ''

      walkChildren( children, null, child => {
        const slots = child.slots || []
        if ( isHoisted( child.name ) ) {
          // add to main
          slots.forEach( slot => mainSlots.add( slot ) )
        } else {
          let isParentHoisted = false
          traverseUp( child, parent => {
            if ( parent && isHoisted( parent.name ) ) {
              isParentHoisted = true
              return false
            }
          } )

          if ( isParentHoisted ) {
            // add to main
            slots.forEach( slot => mainSlots.add( slot ) )
          } else {
            // add to subpackage
            subpackageSlots[ root ] = subpackageSlots[ root ] || new Set()
            slots.forEach( slot => subpackageSlots[ root ].add( slot ) )
          }
        }
      } )
    } )
    // End: find hoisted slots

    // prepare { name: { outPath, root } }
    const NAME_MAP = {}
    components.forEach( component => {
      const { name, subpackage } = component

      const root = isHoisted( name ) ?
        '' :
        ( subpackage ? subpackage.root + '/' : '' )

      const outPath = constants.COMPONENT_OUTPUT_PATH
        .replace( /\[root\]/g, root )
        .replace( /\[name\]/g, name ) +
        extensions.template

      NAME_MAP[ name ] = { outPath, root }
    } )

    // begin generate components and slots

    components.forEach( component => {
      const { name, body, imports, subpackage, needHtmlParse } = component
      const { outPath, root } = NAME_MAP[ name ]
      const pathPrefix = relativeToRoot( outPath )
      const content = []

      const MAIN_SLOTS_OUTPATH = constants.SLOTS_OUTPUT_PATH
        .replace( /\[root\]/g, '' ) + extensions.template
      const SUBPACKAGE_SLOTS_OUTPATH = constants.SLOTS_OUTPUT_PATH
        .replace( /\[root\]/g, root ) + extensions.template

      // add main slots import
      const mainSlotsSrc = pathPrefix + MAIN_SLOTS_OUTPATH
      content.push( generators.import.template( { src: mainSlotsSrc } ) )

      // add subpackage slots import
      if ( root && subpackageSlots[ root ] ) {
        const subpackageSlotsSrc = pathPrefix + SUBPACKAGE_SLOTS_OUTPATH
        content.push( generators.import.template( { src: subpackageSlotsSrc } ) )
      }

      // add htmlparse import
      if ( needHtmlParse ) {
        const htmlParsePath = pathPrefix + htmlParsePaths.template
        content.push( generators.import.template( { src: htmlParsePath } ) )
      }

      // add dependency imports
      Object.keys( imports ).forEach( key => {
        const imp = imports[ key ]

        if ( NAME_MAP[ imp.name ] ) {
          const { root } = NAME_MAP[ imp.name ]
          const importSrc = pathPrefix + constants.COMPONENT_OUTPUT_PATH
            .replace( /\[root\]/g, root )
            .replace( /\[name\]/g, imp.name ) +
            extensions.template

          content.push( generators.import.template( { src: importSrc } ) )
        } else {
          // emitError( compilation, `Cannot resolve ${ imp.resolved } as component` )
        }
      } )

      content.push( body )

      emitFile(
        outPath,
        content.join( '\n' ),
        compilation
      )
    } )

    // main slots
    emitFile(
      constants.SLOTS_OUTPUT_PATH
        .replace( /\[root\]/g, '' ) +
      extensions.template,
      generators.slots( genSlotsGeneratorArgs( {
        slots: mainSlots,
        constants,
        NAME_MAP,
        htmlParsePaths,
        htmlParse,
      } ) ),
      compilation
    )

    // subpackage slots
    Object.keys( subpackageSlots ).forEach( root => {
      const slots = subpackageSlots[ root ]
      emitFile(
        constants.SLOTS_OUTPUT_PATH
          .replace( /\[root\]/g, root ) +
        extensions.template,
        generators.slots( genSlotsGeneratorArgs( {
          slots: slots,
          root,
          constants,
          NAME_MAP,
          htmlParsePaths,
          htmlParse,
        } ) ),
        compilation
      )
    } )

  }
}

function genSlotsGeneratorArgs( {
  slots, root = '', NAME_MAP, constants,
  htmlParsePaths, htmlParse
} ) {
  slots = Array.from( slots )
  const slotOutPath = constants.SLOTS_OUTPUT_PATH
    .replace( /\[root\]/g, root )
  const pathPrefix = relativeToRoot( slotOutPath )

  return slots.reduce( ( total, slot ) => {
    const srcs = slot.dependencies.map( name => {
      if ( NAME_MAP[ name ] ) {
        const { outPath } = NAME_MAP[ name ]
        return pathPrefix + outPath
      }
    } ).filter( Boolean )

    total.imports = total.imports.concat( srcs )
    total.bodies.push( slot.body )

    return total
  }, {
    imports: htmlParse ? [ pathPrefix + htmlParsePaths.template ] : [],
    bodies: []
  } )
}

function normalizeGeneratorOptions( options, { constants, extensions } ) {
  const entryComponent = options.entryComponent || {}
  const root = entryComponent.root || ''
  const name = entryComponent.name || ''

  // resolve entryComponent src
  entryComponent.src = constants.COMPONENT_OUTPUT_PATH
    .replace( /\[root\]/g, root ? root + '/' : '' )
    .replace( /\[name\]/g, name ) +
    extensions.template

  return options
}

function normalizeImports( {
  imports = {},
  importeeOutPath,
  extensions = {},
  subpackages = []
} ) {
  imports = Object.assign( {}, imports )

  Object.keys( imports ).forEach( k => {
    const { name, resolved } = imports[ k ]

    const subpackage = subpackagesUtil.findSubpackage( resolved, subpackages )
    const root = subpackage ? subpackage.root + '/' : ''

    const src = relativeToRoot( importeeOutPath ) +
      constants.COMPONENT_OUTPUT_PATH
        .replace( /\[root\]/g, root )
        .replace( /\[name\]/g, name ) +
      extensions.template

    imports[ k ].src = src
  } )

  return imports
}

const relativeToRoot = require( '../../shared/utils/relativeToRoot' )
const { ROOT_DATA_VAR } = require( '../../shared/utils/constants' )

module.exports = function ( { file, entryComponent } = {} ) {
  return `
<import src="${ relativeToRoot( file ) }${ entryComponent.src }" />
<template is="${ entryComponent.name }" data="{{ ...${ROOT_DATA_VAR}['0'], ${ROOT_DATA_VAR} }}"/>
  `.trim()
}

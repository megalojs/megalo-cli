var expect = require('chai').expect
var loader = require('../lib/px2rpx-loader')

describe('Loader', function () {

  it('should transform px value into rpx', function () {
    var output = loader.call({}, 'body {width: 750px}')
    expect(output).is.a('string')
    expect(output).to.equal('body {\n  width: 750rpx;\n}')
  })
})

describe('Transform Value Comment', function () {

  it('should support `no` transform value comment', function () {
    var output = loader.call({}, 'body {width: 750px; /*no*/}')
    expect(output).is.a('string')
    expect(output).to.equal('body {\n  width: 750px;\n}')
  })

})

describe('Loader Query', function () {

  it('should support `rpxUnit` query', function () {
    var output = loader.call({query: '?rpxUnit=0.5'}, 'body {width: 375px}')
    expect(output).is.a('string')
    expect(output).to.equal('body {\n  width: 750rpx;\n}')
  })

  it('should support `rpxUnit` & `rpxPrecision` query', function () {
    var output = loader.call({query: '?rpxUnit=3&rpxPrecision=3'}, 'body {width: 10px}')
    expect(output).is.a('string')
    expect(output).to.equal('body {\n  width: 3.333rpx;\n}')
  })

})

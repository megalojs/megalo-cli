const test = require('ava');
const compile = require('../compile')
const path = require('path');
const MultiPlatformResolver = require( '../../lib/plugins/MultiPlatformResolver' )
const baseConfig = require('../baseConfig')('./plugins/cases/multi-platform-resolver', function (config) {
    config.resolve.plugin('multi-platform-resolver').use(MultiPlatformResolver, ['wechat'])
})

test.serial('resolve api in vue file', async t => {
	await compile(baseConfig, 'resolveApiInVue.vue').then(() => {
        t.pass();
    }).catch(() => {
        t.fail();
    });
})

test.serial('resolve api in js file', async t => {
    await compile(baseConfig, 'resolveApiInJs.js').then(() => {
        t.pass();
    }).catch(() => {
        t.fail();
    });
})

test.serial('return index without platform', async t => {
    let result = await compile(baseConfig, 'demoApiReturnIndex.js');

    t.snapshot(result.js);
})

test.serial('return platform first', async t => {
    let result = await compile(baseConfig, 'demoApiReturnCurrentPlatform.js');

    t.snapshot(result.js);
})

test.serial('throws error without file to return', async t => {
    await compile(baseConfig, 'demoApiGotError.js').then(() => {
        t.fail();
    }).catch(() => {
        t.pass();
    });
})

const test = require('ava');
const compile = require('../compile')
const path = require('path');
const baseConfig = require('../baseConfig')('./config/cases/resolve', function (config) {
    config.resolve.extensions.add('.js').add('.css')
    config.resolve.mainFiles.add('index').add('index.wechat').add('index.default')
})

test.serial('resolve css in js file', async t => {
    await compile(baseConfig, 'resolveCssInJs.js').then(() => {
        t.pass();
    }).catch(() => {
        t.fail();
    });
})

test.serial('resolve css in vue file', async t => {
    await compile(baseConfig, 'resolveCssInVue.vue').then(() => {
        t.pass();
    }).catch(() => {
        t.fail();
    });
})

test.serial('resolve js file', async t => {
    await compile(baseConfig, 'resolveJs.js').then(() => {
        t.pass();
    }).catch(() => {
        t.fail();
    });
})

test.serial('fail when file not found', async t => {
    await compile(baseConfig, 'resolveCssInJsError.js').then(() => {
        t.fail();
    }).catch(() => {
        t.pass();
    });

    await compile(baseConfig, 'resolveCssInVueError.vue').then(() => {
        t.fail();
    }).catch(() => {
        t.pass();
    });

    await compile(baseConfig, 'resolveJsError.js').then(() => {
        t.fail();
    }).catch(() => {
        t.pass();
    });
})
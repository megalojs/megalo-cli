const test = require('ava');
const path = require('path');
const render = require('../render');
const attachModuleToOptions = require('../../lib/frameworks/vue/utils/attachMultiPlatformModule.js');
const compile = require('../compile')
const createMegaloTarget = require('../../lib/index')
const baseConfig = require('../baseConfig')('./codegen/cases/multi-platform', function (config) {
    config.merge({
        target: createMegaloTarget({
            platform: 'wechat'
        })
    })
})


let config = {
    target: 'wechat'
}

attachModuleToOptions(config)

test.serial('leave current platform template', t => {
    let result = render(resolve('simple.vue'), config);

	t.snapshot(result.body || "");
})

test.serial('remove other platform template', t => {
    let result = render(resolve('remove.vue'), config);

	t.snapshot(result.body || "");
})

test.serial('leave current platform style', async t => {
    let result = await compile(baseConfig, 'simple-style.vue');

	t.snapshot(result.css);
})

test.serial('remove other platform style', async t => {
    let result = await compile(baseConfig, 'remove-style.vue');

	t.snapshot(result.css || "");
})

function resolve (fileName) {
    return path.join(__dirname, './cases/multi-platform', fileName);
}

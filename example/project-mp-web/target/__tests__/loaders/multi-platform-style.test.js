const test = require('ava');
const compile = require('../compile')
const path = require('path');
const baseConfig = require('../baseConfig')('./loaders/cases/multi-platform-style', function (config) {
    ['css', 'scss'].forEach(function (item) {
        config.module.rule(item)
            .use('multi-platform-style')
                .loader(path.join(__dirname, '../../lib/loaders/multi-platform-style.js'))
                .before('MiniCssExtractPlugin')
    });
})

test.serial('leave current platform style', async t => {
    let result = await compile(baseConfig, 'simple.vue');

	t.snapshot(result.css);
})

test.serial('remove other platform style', async t => {
    let result = await compile(baseConfig, 'style-to-remove.vue');

	t.snapshot(result.css);
})

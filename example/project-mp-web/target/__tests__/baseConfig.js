
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Config = require('webpack-chain');
const webpack = require('webpack');

const createConfig = function (relativePath, cb) {
    return function (entry, platform = 'wechat') {
        const config = new Config();

        config.target(function (compiler) {
            const FunctionModulePlugin = require( 'webpack/lib/FunctionModulePlugin' )
            const JsonpTemplatePlugin = require( 'webpack/lib/web/JsonpTemplatePlugin' )
            const LoaderTargetPlugin = webpack.LoaderTargetPlugin

            new FunctionModulePlugin().apply( compiler )
            new JsonpTemplatePlugin().apply( compiler )
            new LoaderTargetPlugin( 'mp-' + platform ).apply( compiler )
        })

        config
            .mode('development')

            .entry(entry.split('.')[0])
                .add(path.join(__dirname, relativePath, entry))
            
        config.output
            .path(path.join(__dirname, './dist'))
            .filename('[name].js')
            .chunkFilename('[id].js')

        config.optimization
            .runtimeChunk({name: 'runtime'})
            .splitChunks({
                cacheGroups: {
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendor',
                        chunks: 'all'
                    }
                }
            })

        config.module
            .rule('vue')
                .test(/\.vue$/)
                .use('vue')
                    .loader('vue-loader')
                    .options({})
                    .end()
                .end()
            .rule('js')
                .test(/\.js$/)
                .use('babel')
                    .loader('babel-loader')
                    .options({})
                    .end()
                .end()
            .rule('css')
                .test(/\.css$/)
                .use('MiniCssExtractPlugin')
                    .loader(MiniCssExtractPlugin.loader)
                    .end()
                .use('css')
                    .loader('css-loader')
                    .end()
                .end()
            .rule('scss')
                .test(/\.scss$/)
                .use('MiniCssExtractPlugin')
                    .loader(MiniCssExtractPlugin.loader)
                    .end()
                .use('css')
                    .loader('css-loader')
                    .end()
                .use('sass')
                    .loader('sass-loader')
                    .end()
                .end()

        config
            .plugin('vue-loader')
                .use(VueLoaderPlugin)
                .end()
            .plugin('css-extract')
                .use(MiniCssExtractPlugin, [{
                    filename: `[name].css`,
                }])
                .end()

        config.stats('errors-only')

        typeof cb == 'function' && cb(config);

        return config.toConfig();
    }
}

module.exports = createConfig

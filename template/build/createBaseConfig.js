const createMegaloTarget = require( '@megalo/target' )
const compiler = require( '@megalo/template-compiler' )
const VueLoaderPlugin = require( 'vue-loader/lib/plugin' )
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )
const { pagesEntry } = require('@megalo/entry')

const _ = require( './util' );
const appMainFile = _.resolve('src/app.js')
const CSS_EXT = {
  wechat: 'wxss',
  alipay: 'acss',
  swan: 'css',
};

function createBaseConfig( platform = 'wechat' ) {
  const cssExt = CSS_EXT[platform]
  
  return {
    mode: 'development',

    target: createMegaloTarget( {
      compiler: Object.assign( compiler, { } ),
      platform,
      htmlParse: {
        templateName: 'octoParse',
        src: _.resolve(`./node_modules/octoparse/lib/platform/${platform}`)
      },
    } ),

    entry: {
      'app': appMainFile,
      ...pagesEntry(appMainFile)
    },

    output: {
      path: _.resolve( `dist-${platform}/` ),
      filename: 'static/js/[name].js',
      chunkFilename: 'static/js/[id].js'
    },

    devServer: {
      // hot: true,
    },

    optimization: {
      runtimeChunk: {
        name: 'runtime'
      },
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]|megalo[\\/]/,
            name: 'vendor',
            chunks: 'all'
          }
        }
      }
    },

    // devtool: 'cheap-source-map',
    devtool: false,

    resolve: {
      extensions: ['.vue', '.js', '.json'],
      alias: {
        'vue': 'megalo',
        '@': _.resolve('src')
      },
    },

    module: {
      rules: [
        // ... other rules
        {
          test: /\.vue$/,
          use: [
            {
              loader: 'vue-loader',
              options: {}
            }
          ]
        },

        {
          test: /\.js$/,
          use: 'babel-loader'
        },

        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader'
          ]
        },
<% if (cssPreset === 'less') { %>
        {
          test: /\.less$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'less-loader',
          ]
        },
<% } else if (cssPreset === 'stylus') {%>
        {
          test: /\.styl(us)?$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'stylus-loader',
          ]
        },
<% } else {%>
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
          ]
        },
<% } %>
      ]
    },

    plugins: [
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin( {
        filename: `./static/css/[name].${cssExt}`,
      } ),
    ],
    stats:{
      env: true,
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      entrypoints: false,
    }
  }
}

module.exports = createBaseConfig

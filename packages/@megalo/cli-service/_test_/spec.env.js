const path = require('path')

process.env.MEGALO_CLI_CONTEXT = path.resolve(__dirname, './')
require('../lib/webpack.config')

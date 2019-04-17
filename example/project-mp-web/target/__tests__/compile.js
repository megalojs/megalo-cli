const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

function compile (basename, config) {
    const compiler = webpack(config),
        name = basename.split(".")[0];

    return new Promise(function (resolve, reject) {
        compiler.run(function (err, stats) {
            if (err) {
                console.log(err);
                return reject(err)
            }

            const jsonStats = stats.toJson()

            if (jsonStats.errors.length > 0) {
                console.log(jsonStats.errors);
                return reject()
            }

            if (jsonStats.warnings.length > 0) {
                console.log(jsonStats.warnings);
            }

            const jsfile = path.join(__dirname, `./dist/${name}.js`)
            const cssfile = path.join(__dirname, `./dist/${name}.css`)

            let jsFileContent = ''
                cssFileContent = '';

            fs.existsSync(jsfile) && (jsFileContent = fs.readFileSync(jsfile).toString());
            fs.existsSync(cssfile) && (cssFileContent = fs.readFileSync(cssfile).toString());
           
            resolve({
                css: cssFileContent,
                js: jsFileContent
            })
        })
    })
}


module.exports = function (fn, basename) {
    return compile(basename, fn(basename))
}
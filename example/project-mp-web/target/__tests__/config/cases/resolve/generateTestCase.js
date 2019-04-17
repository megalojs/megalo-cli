// use to generate test case for convenience
const fs = require('fs');
const argv = require('yargs').argv
const path = require('path')

const dirName = argv.dirName;


if (!dirName) {
    throw new Error('dirName must be provided');
}

let _arr = dirName.split('-'), _type = _arr[0], _result = _arr[1];

const type = _type || argv.type || 'js' // js css
const result = _result || argv.result || 'platform' // index default platform error
const platform = argv.platform || 'wechat'

const fileArrayObj = {
    index: ['index', 'index.default', `index.${platform}`, 'index.other'],
    platform: ['index.default', `index.${platform}`, 'index.other'],
    default: ['index.default', 'index.other'],
    error: ['index.other']
}

const dir = path.join(__dirname, dirName)

fs.mkdirSync(dir);

try {
    fileArrayObj[result].forEach(function (file) {
        let fileContent = {
            js: `
module.exports = {
    str: '${platform}-${result}',
    from: '${file}'
}
            `,
            css: `
.${platform}-${result}-${file} {
    background-color: #fff;
}
            `
        }

        fs.writeFileSync(path.join(dir, file + '.' + type), fileContent[type])
    });
} catch (e) {
    console.log(e);
}


const fs = require('fs');
const compile = require('@megalo/template-compiler').compileToTemplate

module.exports = function (filePath, option) {
    let content = '';

    try {
        content = fs.readFileSync(filePath).toString();
    } catch (e) {}

    if (!content) {
        return '';
    }

    return compile(content, option);
}
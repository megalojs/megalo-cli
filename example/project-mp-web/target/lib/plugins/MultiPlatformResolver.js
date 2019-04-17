const fs = require('fs');

// consider only js file now
const extension = 'mpjs';

class MultiPlatformResolver {
    constructor(platform) {
        this.platform = platform
    }

    apply(resolver) {
        const target = resolver.ensureHook('resolved');
        const platform = this.platform;

        resolver.getHook('resolve')
            .tapAsync("MultiPlatformResolver", (request, resolveContext, callback) => {
                let requestPath = request.request,
                    dirPath = request.path,
                    fileNameExp = new RegExp(`([\\w\\.-]+)(\\/index\\.${extension}$)`);

                    requestPath.indexOf('Phlist') != -1 && console.log(requestPath)
                
                // looking for file according to the following order:
                //
                // 1. file for current platform index.${platform}.js
                // 2. index.js
                //
                // otherwise throws an error

                if (fileNameExp.test(requestPath)) {
                    let attempts = ['index.js', `index.${platform}.js`];

                    attempts = attempts.map(function (item) {
                        return requestPath.replace(fileNameExp, function (match, p1, p2) {
                            return p1 + '/' + item;
                        });
                    });

                    let filePathToBeDefine = "";
                
                    for (let i = attempts.length - 1; i >= 0; i--) {
                        let filePath = resolver.join(dirPath, attempts[i]);
                        
                        if (fs.existsSync(filePath)) { // check if the file exists
                            filePathToBeDefine = filePath;

                            break;
                        }
                    }
                    
                    if (filePathToBeDefine) {
                        request.path = filePathToBeDefine; // modify the final request path

                        return resolver.doResolve(target, request, null, resolveContext, callback);
                    } else {
                        return callback(new Error(`cannot find a file for current platform in ${resolver.join(dirPath, requestPath.replace(`.${extension}`, ''))}`));
                    }                    
                }

                return callback();
            })

            resolver.getHook('resolved')
                .tapAsync("MultiPlatformResolver", (request, resolveContext, callback) => {
                    request.path.indexOf('Phlist') != -1 && console.log(request.path)

                    return callback();
                })
    }
}

module.exports = MultiPlatformResolver
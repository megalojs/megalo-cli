const path = require('path');
const fs = require('fs');
const getPageConfig = require('./getPageConfig');
const { babel } = require('./babel');
const entryComponentPlugin = require('../babel-plugins/entry-component');
const isEqual = require('lodash.isequal');

const root = path.join(process.cwd(), 'src');

// 1. if the page is a vue file, use it directly in route
// 2. if the page is a js/ts file, find the component location then use the component in route
module.exports = function (compiler, megaloOptions) {
    let countObj = {
        pageCount: 0,
        subPackageCount: 0
    }

    const config = getPageConfig(megaloOptions.projectOptions || {})
    const pageEntry = [], subPackageEntry = [];

    config.pages && config.pages.forEach((page) => {
        pageEntry.push({
            page,
            component: getComponentPath(page)
        });
    });

    config.subPackages && config.subPackages.forEach((page) => {
        // {
        //     root: '',
        //     pages: ['pages/a/index']
        // }
        if (page && typeof page == 'object') {
            page.pages.forEach((item) => {
                let pagePath = path.join(page.root, item);

                subPackageEntry.push({
                    page: pagePath,
                    component: getComponentPath(pagePath)
                });
            })
        } else {
            subPackageEntry.push({
                page,
                component: getComponentPath(page)
            });
        }
    });

    const outputPrefix = path.join(process.cwd(), 'dist-web');

    !fs.existsSync(outputPrefix) && fs.mkdirSync(outputPrefix, { recursive: true });
    
    const routeFile = generateRouteFile({ pageEntry, subPackageEntry, countObj });        
    const routeFilePath = path.join(outputPrefix, 'router.js'),
        entryFilePath = path.join(outputPrefix, 'webEntry.js'),
        appVuePath = path.join(outputPrefix, 'app.vue'),
        processedConfig = { pageEntry, subPackageEntry };

    // output routeFile
    (!compiler.configCache || !isEqual(processedConfig, compiler.configCache)) && fs.writeFileSync(routeFilePath, routeFile, { flag: 'w+' });
    compiler.configCache = processedConfig;

    // copy entryFile
    !fs.existsSync(entryFilePath) && fs.copyFileSync(path.join(__dirname, '../template/webEntry.js'), entryFilePath);
    
    // copy app.vue
    !fs.existsSync(appVuePath) && fs.copyFileSync(path.join(__dirname, '../template/app.vue'), appVuePath);
}

function getComponentPath(route) {
    let pagePath = path.join(root, route), filePath = '';

    filePath = pagePath + '.vue';

    if (fs.existsSync(filePath)) {
        return filePath;
    }

    filePath = '';

    if (fs.existsSync(pagePath + '.js')) {
        filePath = pagePath + '.js';
    } else if (fs.existsSync(pagePath + '.ts')) {
        filePath = pagePath + '.ts';
    }

    if (filePath) {
        const source = fs.readFileSync(filePath, { encoding: 'utf8' });
        const babelOptions = {
            filename: filePath,
            plugins: [
                entryComponentPlugin
            ]
        }

        const { metadata } = babel.transform(source, babelOptions)
        
        if (!metadata.megaloEntryComponent) {
            throw new Error(`[@MEGALO/TARGET] cannot find component for ${route}`);
        }

        return path.join(path.dirname(filePath), metadata.megaloEntryComponent);
    }

    throw new Error(`[@MEGALO/TARGET] cannot find component for ${route}`);
}

function generateRouteFile ({ pageEntry, subPackageEntry, countObj }) {
    let imports = [], route = [], output = [];

    imports.push(`import Router from  'vue-router'`, `import Vue from 'vue'`)
    
    pageEntry.forEach((page) => {
        countObj.pageCount++;
        page.componentName = 'page' + countObj.pageCount;
        imports.push(`import ${page.componentName} from '${page.component}'`);
        route.push(`{ path: '${getPath(page.page)}', component: ${page.componentName} }`);
    });

    subPackageEntry.forEach((page) => {
        countObj.subPackageCount++;
        page.componentName = 'subPackage' + countObj.subPackageCount;
        imports.push(`
const ${page.componentName} = function () {
    return import('${page.component}')
}
        `);
        route.push(`{ path: '${getPath(page.page)}', component: ${page.componentName} }`);
    });

    output.push(`Vue.use(Router);`, `
const router = new Router({
    routes 
})`, `export default router`)

    return `
${imports.join('\n')}
    
const routes = [
${route.join(`,\n`)}
]    

${output.join(`\n`)}
    `
}

// add / before route
function getPath (routePath) {
    let newPath = routePath.trim();

    if (!/^\//.test(newPath)) {
        newPath = '/' + newPath;
    }
    
    return newPath;
}
const JSON5 = require( 'json5' )
const yaml = require( 'js-yaml' )
const toString = Object.prototype.toString

const handlers = {
    json({ source, filepath } = {}) {
        return JSON5.parse(source)
    },

    yaml({ source, filepath } = {}) {
        return yaml.safeLoad(source, {
            filename: filepath,
            json: true,
        })
    },
}

function parseConfig({ source, lang, filepath } = {}, callback) {
    const normalizeMap = {
        json: 'json',
        json5: 'json',
        yaml: 'yaml',
        yml: 'yaml',
    }

    const normalizedLang = normalizeMap[lang]

    const handler = handlers[normalizedLang]

    if (!handler) {
        return callback(new Error(
            'Invalid lang for config block: "' + lang + '", ' +
            'consider using "json" or "yaml"'
        ))
    }

    let config
    
    try {
        config = handler({
            source,
            filepath,
        })

        if (toString.call(config) !== '[object Object]') {
            config = {}
        }

        if (typeof callback == 'function') {
            callback(null, config)
        } else {
            return config;
        }
    } catch (e) {
        if (typeof callback == 'function') {
            callback(e);
        } else {
            throw e;
        }
    }
}

module.exports = parseConfig;
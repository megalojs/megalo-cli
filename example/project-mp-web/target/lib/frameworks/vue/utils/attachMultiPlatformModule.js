module.exports = function (option) {
    // attach a module to option in order to remove the template not belong to current platform
    const removeTemplateModule = {
        transformNode (el) {
            if (el.tag && el.tag == 'template' && el.attrsMap.platform && el.attrsMap.platform != option.target) {
                // transfer the node to an empty one
                el.type = 3;
                el.text = '';
                el.attrsMap = {};
                el.attrsList = [];
                el.children = [];
                el.static = true;
            }

            return el;
        }
    }

    if (typeof option.modules == "undefined") {
        option.modules = [];
    }

    option.modules.push(removeTemplateModule);
}
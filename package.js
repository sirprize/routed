var profile = (function (){

    var miniExcludes = {
            "LICENSE": 1,
            "spirr/package": 1,
            "spirr/package.json": 1,
            "readme.md": 1
        },
        isTestRe = /\/tests\//
    ;

    return {
        resourceTags: {
            test: function (filename, moduleId) {
                return isTestRe.test(filename);
            },

            miniExclude: function (filename, moduleId) {
                return isTestRe.test(filename) || moduleId in miniExcludes || /\/vendor\//.test(moduleId);
            },

            amd: function (filename, moduleId) {
                return /\.js$/.test(filename);
            }
        }
    };
})();
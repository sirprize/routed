define([], function() {
    return function (schema, callback) {
        return {
            callback: callback,
            
            match: function (pathname) {
                var pathParts = pathname.replace(/^\/|\/$/g, "").split('/');
                var schemaParts = schema.replace(/^\/|\/$/g, "").split('/');
                var params = {}, partIndex = 0, param = null;

                if (pathParts.length !== schemaParts.length) {
                    return false;
                }

                for (partIndex = 0; partIndex < pathParts.length; partIndex += 1) {
                    if (schemaParts[partIndex].match(/^\:(\w*)$/)) {
                        param = schemaParts[partIndex].replace(/^\:(\w*)$/, "$1");
                        params[param] = decodeURIComponent(pathParts[partIndex]);
                    }
                    else if (schemaParts[partIndex] !== decodeURIComponent(pathParts[partIndex])) {
                        return false;
                    }
                }

                return params;
            },

            assemble: function (params, query) {}
        };
    };
});
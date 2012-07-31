define([], function() {
    return function (schema, run) {
        return {
            run: run,
            
            match: function (pathname) {
                var pathParts = pathname.replace(/^\/|\/$/g, "").split('/'),
                schemaParts = schema.replace(/^\/|\/$/g, "").split('/'),
                params = {}, partIndex = 0, param = null;

                if (pathParts.length !== schemaParts.length) {
                    return false;
                }

                for (var partIndex = 0; partIndex < pathParts.length; partIndex += 1) {
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

            assemble: function (params, query) {
                var url = '', param = null, part = null, schemaParts = schema.replace(/^\/|\/$/g, "").split('/');
                
                for (var partIndex = 0; partIndex < schemaParts.length; partIndex += 1) {
                    if (schemaParts[partIndex].match(/^\:(\w*)$/)) {
                        param = schemaParts[partIndex].replace(/^\:(\w*)$/, "$1");
                        
                        if(params[param] == undefined) {
                            throw Error('Missing param "' + param + '" for schema: "' + schema + '"');
                        }

                        part = params[param];
                    }
                    else {
                        part = schemaParts[partIndex];
                    }
                    
                    url += '/' + part;
                }
                
                if (schema.match(/\/$/)) {
                    url += '/';
                }
                
                return url;
            }
        };
    };
});
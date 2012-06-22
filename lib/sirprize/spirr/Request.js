define([], function() {
    
    var trim = function (s) {
        return s.replace(/^\s+|\s+$/g, "");
    }

    var getPathname = function (url) {
        var pathname = url.replace(/(\w+:\/\/[^\/]*)?(\/[^\?]*)(\?.*)*$/, "$2");
        // return empty string for non-valid input (such as relative urls etc)
        return (pathname.match(/^\//)) ? pathname : '';
    }

    var getQueryParams = function (url) {
        var queryParams = {},
            queryString = null,
            nameVals = null,
            i = null,
            nameVal = null,
            queryString = url.split('?')[1] || '';

        if (queryString) {
            nameVals = queryString.split('&');

            for (i = 0; i < nameVals.length; i = i + 1) {
                nameVal = nameVals[i].split('=');
                queryParams[trim(decodeURIComponent(nameVal[0]))] = trim(decodeURIComponent(nameVal[1]));
            }
        }

        return queryParams;
    };

    return function (url) {
        var pathname = getPathname(trim(decodeURIComponent(url)));
        var queryParams = getQueryParams(url);
        var pathParams = {};
        
        return {
            getPathname: function () {
                return pathname;
            },
            
            getQueryParams: function () {
                return queryParams;
            },
            
            getPathParams: function () {
                return pathParams;
            },
            
            setPathParam: function (name, val) {
                pathParams[name] = val;
            },
            
            getPathParam: function(name) {
                return pathParams[name] || null;
            },
            
            getQueryParam: function(name) {
                return queryParams[name] || null;
            },

            isSame: function (url) {
                var name, qp;

                if (pathname !== getPathname(url)) {
                    // pathname is different
                    return false;
                }

                qp = getQueryParams(url);

                for (name in queryParams) {
                    if (queryParams.hasOwnProperty(name) && (qp[name] === undefined || qp[name] !== queryParams[name])) {
                        // param is missing in qp or value is different
                        return false;
                    }
                }

                for (name in qp) {
                    if (qp.hasOwnProperty(name) && (queryParams[name] === undefined || qp[name] !== queryParams[name])) {
                        // param is missing in queryParams or value is different
                        return false;
                    }
                }

                return true;
            },

            debug: function() {
                console.log('getPathname(): ', this.getPathname());
                console.log('getQueryParams(): ', this.getQueryParams());
                console.log('getPathParams(): ', this.getPathParams());
            }
        };
    };
});
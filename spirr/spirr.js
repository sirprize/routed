(function (){
	
	
	(function setup() {
		// Save a reference to the global object.
		var root = this;

		// Save the previous value of the `Spirr` variable (in case it exists in the global space)
		var previousSpirr = root.Spirr;

		// The top-level namespace. All public Spirr classes and modules will
		// be attached to this. Exported for both CommonJS and the browser.
		var Spirr;
		if (typeof exports !== 'undefined') {
			Spirr = exports;
		} else {
			Spirr = root.Spirr = {};
		}

		// Current version of the library
		Spirr.VERSION = '0.1';

		// Runs Spirr in *noConflict* mode, returning the `Spirr` variable
		// to its previous owner. Returns a reference to this Spirr object.
		Spirr.noConflict = function () {
			root.Spirr = previousSpirr;
			return this;
		};
	}());
	
	
	
	Spirr.makeRequestObject = function (url) {

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

		var pathname = getPathname(trim(decodeURIComponent(url)));
		var queryParams = getQueryParams(url);
		var pathParams = {};

		return {
			getPathname: function () { return pathname; },
			getQueryParams: function () { return queryParams; },
			getPathParams: function () { return pathParams; },
			setPathParam: function (name, val) { pathParams[name] = val; },
			
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
			}
		};
	};



	Spirr.makeRouterObject = function (routeMap) {
		var currentRouteName = null, routes = [], mapItemName;

		var addRoute = function (mapItemName, route) {
			routes[mapItemName] = route;
		};

		for (mapItemName in routeMap) {
			if (routeMap.hasOwnProperty(mapItemName)) {
				addRoute(mapItemName, Spirr.makeRouteObject(routeMap[mapItemName]));
			}
		}

		return {
			route: function (request) {
				var routeName, paramName, routeParams = [];
				
				for (routeName in routes) {
					if (routes.hasOwnProperty(routeName)) {
						// find a matching route to the current PATH_INFO
						routeParams = routes[routeName].match(request.getPathname());
						if (routeParams) {
							// route found
							currentRouteName = routeName;
							for (paramName in routeParams) {
								if (routeParams.hasOwnProperty(paramName)) {
									// inject returning values to the request object.
									request.setPathParam(paramName, routeParams[paramName]);
								}
							}
							return request;
						}
					}
				}
				return null;
			},

			getCurrentRouteName: function () {
				return currentRouteName;
			}
		};

	};
	


	Spirr.makeRouteObject = function (schema) {

		return {
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
		}
	};



	Spirr.makeControllerObject = function (routeMap, dispatcher) {
		var router = Spirr.makeRouterObject(routeMap);
		
		return {
			request: null,
			url: null,

			run: function (url) {
				if (this.request && this.request.isSame(url)) {
					//alert('already running');
					return true;
				}
				
				this.url = url;
				this.request = Spirr.makeRequestObject(url);
				router.route(this.request);
				dispatcher(router.getCurrentRouteName(), this.request);
			},
			
			
			go: function (url, title) {
				if (!(window.history && history.pushState)) {
					// not supported by browser - make the trip to server
					return false;
				}
				
				if (this.request && this.request.isSame(url)) {
					// is identical - dont pushstate
					//alert('already at destination');
					return true;
				}
				
				this.url = url;
				this.request = Spirr.makeRequestObject(url);
				
				if (!router.route(this.request)) {
					return false;
				}
				
				history.pushState({}, title, url);
				dispatcher(router.getCurrentRouteName(), this.request);
				return true;
			},

			getRequest: function () {
				return this.request;
			}/*,
			
			
			getRouter: function () {
				return router;
			}
			*/
		}
	};
	
}).call(this);
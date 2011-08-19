var dispatcher = function (routeName, request) {
	if (!routeName) {
		//alert('no route found')
	}
	
	//alert(routeName);
	
	console.log('ROUTE:', routeName);
	console.log('PATHNAME:', request.getPathname());
	console.log('PATHPARAMS: ');
	console.dir(request.getPathParams());
	console.log('QUERYPARAMS: ');
	console.dir(request.getQueryParams());
};

var routeMap = {
	'releases': '/releases',
	'releases-with-trailing-slash': '/releases/',
	'release': '/releases/:release',
	'release-tracks': '/releases/:release/tracks/:track'
};

//var controller = Spirr.makeControllerObject(routeMap, dispatcher);
//controller.run('/releases/ay-ay-ay');


module('Request');

test('Testing Pathname And Queryparams', function() {
	
	var url = 'http://example.com/some/path?aa=AA&sort(+title)&bb=BB%20BB';
	var request = Spirr.makeRequestObject(url);
    equal(request.getPathname(), '/some/path', url);
	deepEqual(request.getQueryParams(), { aa: 'AA', 'sort(+title)': 'undefined', bb: 'BB BB' }, url);
	
	var url = 'https://example.com/some/path?aa=AA&sort(+title)&bb=BB%20BB';
	var request = Spirr.makeRequestObject(url);
    equal(request.getPathname(), '/some/path', url);
	deepEqual(request.getQueryParams(), { aa: 'AA', 'sort(+title)': 'undefined', bb: 'BB BB' }, url);
	
	var url = '/some/path?aa=AA&sort(+title)&bb=BB%20BB';
	var request = Spirr.makeRequestObject(url);
    equal(request.getPathname(), '/some/path', url);
	deepEqual(request.getQueryParams(), { aa: 'AA', 'sort(+title)': 'undefined', bb: 'BB BB' }, url);
	
	var url = '/some/path';
	var request = Spirr.makeRequestObject(url);
    equal(request.getPathname(), '/some/path', url);
	deepEqual(request.getQueryParams(), {}, url);
	
	// invalid url (missing protocol)
	var url = 'example.com/some/path';
	var request = Spirr.makeRequestObject(url);
    equal(request.getPathname(), '', url);
	
	// invalid url (relative url's are not supported)
	var url = '../some/path';
	var request = Spirr.makeRequestObject(url);
    equal(request.getPathname(), '', url);
	
});


module('Route');

test('Testing Route', function() {
	
	var schema = '/releases', pathname = '/releases';
	var route = Spirr.makeRouteObject(schema);
	deepEqual(route.match(pathname), {}, pathname);
	
	var schema = '/releases/ay ay ay', pathname = '/releases/ay%20ay%20ay';
	var route = Spirr.makeRouteObject(schema);
	deepEqual(route.match(pathname), {}, pathname);
	
	var schema = '/releases/:release', pathname = '/releases/ay-ay-ay';
	var route = Spirr.makeRouteObject(schema);
	deepEqual(route.match(pathname), { release: 'ay-ay-ay' }, pathname);
	
	var schema = '/releases/:release/tracks/:track', pathname = '/releases/ay-ay-ay/tracks/menta%20latte';
	var route = Spirr.makeRouteObject(schema);
	deepEqual(route.match(pathname), { release: 'ay-ay-ay', track: 'menta latte' }, pathname);
	
});


module('Router');

test('Testing Router', function() {
	
	var routeMap = {
		'releases': '/releases',
		'release': '/releases/:release',
		'release-track': '/releases/:release/tracks/:track'
	};
	
	var router = Spirr.makeRouterObject(routeMap);
	var request = Spirr.makeRequestObject('http://example.com/some/url/that/wont/match/any/route');
	r = router.route(request);
	deepEqual(r, null, request.getPathname());
	
	var router = Spirr.makeRouterObject(routeMap);
	var request = Spirr.makeRequestObject('http://example.com/releases');
	r = router.route(request);
	equal(router.getCurrentRouteName(), 'releases', request.getPathname());
	deepEqual(r.getPathParams(), {}, request.getPathname());
	
	var router = Spirr.makeRouterObject(routeMap);
	var request = Spirr.makeRequestObject('http://example.com/releases/'); // trailing slash
	r = router.route(request);
	equal(router.getCurrentRouteName(), 'releases', request.getPathname());
	deepEqual(r.getPathParams(), {}, request.getPathname());
	
	var router = Spirr.makeRouterObject(routeMap);
	var request = Spirr.makeRequestObject('http://example.com/releases/ay-ay-ay');
	r = router.route(request);
	equal(router.getCurrentRouteName(), 'release', request.getPathname());
	deepEqual(r.getPathParams(), { release: 'ay-ay-ay' }, request.getPathname());
	
	
	// testing the matching-order
	// priority goes from most specific to least specific
	var routeMap = {
		'article-with-fixed-name': '/articles/some-name',
		'article': '/articles/:article'
	};
	
	var router = Spirr.makeRouterObject(routeMap);
	var request = Spirr.makeRequestObject('http://example.com/articles/some-name');
	r = router.route(request);
	equal(router.getCurrentRouteName(), 'article-with-fixed-name', request.getPathname());
	deepEqual(r.getPathParams(), {}, request.getPathname());
	
	var routeMap = {
		'article': '/articles/:article',
		'article-with-fixed-name': '/articles/some-name'
	};
	
	var router = Spirr.makeRouterObject(routeMap);
	var request = Spirr.makeRequestObject('http://example.com/articles/some-name');
	r = router.route(request);
	equal(router.getCurrentRouteName(), 'article', request.getPathname());
	deepEqual(r.getPathParams(), { article: 'some-name' }, request.getPathname());
	
	// partial matching tests
	// paths have to be fully matched (from beginning to end)
	var routeMap = {
		'post1': '/posts',
		'post2': '/posts/blabla'
	};
	
	var router = Spirr.makeRouterObject(routeMap);
	var request = Spirr.makeRequestObject('http://example.com/posts');
	r = router.route(request);
	equal(router.getCurrentRouteName(), 'post1', request.getPathname());
	deepEqual(r.getPathParams(), {}, request.getPathname());
	
	var routeMap = {
		'post2': '/posts/blabla',
		'post1': '/posts'
	};
	
	var router = Spirr.makeRouterObject(routeMap);
	var request = Spirr.makeRequestObject('http://example.com/posts');
	r = router.route(request);
	equal(router.getCurrentRouteName(), 'post1', request.getPathname());
	deepEqual(r.getPathParams(), {}, request.getPathname());
	
});
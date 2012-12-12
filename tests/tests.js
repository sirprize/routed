define([
    "routed/Request",
    "routed/Router",
    "routed/Route"
], function (
    Request,
    Router,
    Route
) {
    "use strict";
    
    module('Request');

    test('Testing Pathname And Queryparams', function () {

        var url = 'http://example.com/some/path?aa=AA&sort(+title)&bb=BB%20BB';
        var request = new Request(url);
        equal(request.getPathname(), '/some/path', url);
        deepEqual(request.getQueryParams(), { aa: 'AA', 'sort(+title)': 'undefined', bb: 'BB BB' }, url);

        var url = 'https://example.com/some/path?aa=AA&sort(+title)&bb=BB%20BB';
        var request = new Request(url);
        equal(request.getPathname(), '/some/path', url);
        deepEqual(request.getQueryParams(), { aa: 'AA', 'sort(+title)': 'undefined', bb: 'BB BB' }, url);

        var url = '/some/path?aa=AA&sort(+title)&bb=BB%20BB';
        var request = new Request(url);
        equal(request.getPathname(), '/some/path', url);
        deepEqual(request.getQueryParams(), { aa: 'AA', 'sort(+title)': 'undefined', bb: 'BB BB' }, url);

        var url = '/some/path';
        var request = new Request(url);
        equal(request.getPathname(), '/some/path', url);
        deepEqual(request.getQueryParams(), {}, url);

        // invalid url (missing protocol)
        var url = 'example.com/some/path';
        var request = new Request(url);
        equal(request.getPathname(), '', url);

        // invalid url (relative url's are not supported)
        var url = '../some/path';
        var request = new Request(url);
        equal(request.getPathname(), '', url);
    });

    module('Route');

    test('Testing Route', function () {

        var schema = '/releases', pathname = '/releases';
        var route = new Route(schema, function (){});
        deepEqual(route.match(pathname), {}, pathname);

        var schema = '/releases/ay ay ay', pathname = '/releases/ay%20ay%20ay';
        var route = new Route(schema, function (){});
        deepEqual(route.match(pathname), {}, pathname);

        var schema = '/releases/:release', pathname = '/releases/ay-ay-ay';
        var route = new Route(schema, function (){});
        deepEqual(route.match(pathname), { release: 'ay-ay-ay' }, pathname);

        var schema = '/releases/:release/tracks/:track', pathname = '/releases/ay-ay-ay/tracks/menta%20latte';
        var route = new Route(schema, function (){});
        deepEqual(route.match(pathname), { release: 'ay-ay-ay', track: 'menta latte' }, pathname);
        
        var route = new Route('/releases/:id', function (){});
        equal(route.assemble({ id: 'xxx' }), '/releases/xxx');
        
        var route = new Route('/releases', function (){});
        equal(route.assemble(null, { find: 'xxx' }), '/releases?find=xxx');
    });

    module('Router');

    test('Testing Router', function () {

        var routeMap = {
            'releases': Route('/releases', function (){}),
            'release': Route('/releases/:release', function (){}),
            'release-track': Route('/releases/:release/tracks/:track', function (){})
        };

        var router = new Router(routeMap);
        var request = new Request('http://example.com/some/url/that/wont/match/any/route');
        var r = router.route(request);
        deepEqual(r, null, request.getPathname());

        var router = new Router(routeMap);
        var request = new Request('http://example.com/releases');
        var r = router.route(request);
        equal(router.getCurrentRouteName(), 'releases', request.getPathname());
        deepEqual(r.getPathParams(), {}, request.getPathname());

        var router = new Router(routeMap);
        var request = new Request('http://example.com/releases/'); // trailing slash
        var r = router.route(request);
        equal(router.getCurrentRouteName(), 'releases', request.getPathname());
        deepEqual(r.getPathParams(), {}, request.getPathname());

        var router = new Router(routeMap);
        var request = new Request('http://example.com/releases/ay-ay-ay');
        var r = router.route(request);
        equal(router.getCurrentRouteName(), 'release', request.getPathname());
        deepEqual(r.getPathParams(), { release: 'ay-ay-ay' }, request.getPathname());

        // testing the matching-order
        // priority goes from most specific to least specific
        var routeMap = {
            'article-with-fixed-name': Route('/articles/some-name', function (){}),
            'article': Route('/articles/:article', function (){})
        };

        var router = new Router(routeMap);
        var request = new Request('http://example.com/articles/some-name');
        var r = router.route(request);
        equal(router.getCurrentRouteName(), 'article-with-fixed-name', request.getPathname());
        deepEqual(r.getPathParams(), {}, request.getPathname());

        var routeMap = {
            'article': Route('/articles/:article', function (){}),
            'article-with-fixed-name': Route('/articles/some-name', function (){})
        };

        var router = new Router(routeMap);
        var request = new Request('http://example.com/articles/some-name');
        var r = router.route(request);
        equal(router.getCurrentRouteName(), 'article', request.getPathname());
        deepEqual(r.getPathParams(), { article: 'some-name' }, request.getPathname());

        // partial matching tests
        // paths have to be fully matched (from beginning to end)
        var routeMap = {
            'post1': Route('/posts', function (){}),
            'post2': Route('/posts/blabla', function (){})
        };

        var router = new Router(routeMap);
        var request = new Request('http://example.com/posts');
        var r = router.route(request);
        equal(router.getCurrentRouteName(), 'post1', request.getPathname());
        deepEqual(r.getPathParams(), {}, request.getPathname());

        var routeMap = {
            'post2': Route('/posts/blabla', function (){}),
            'post1': Route('/posts', function (){})
        };

        var router = new Router(routeMap);
        var request = new Request('http://example.com/posts');
        var r = router.route(request);
        equal(router.getCurrentRouteName(), 'post1', request.getPathname());
        deepEqual(r.getPathParams(), {}, request.getPathname());

    });
});
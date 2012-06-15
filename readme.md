# Spirr (Single Page Interface Request Router)

Spirr is a AMD compliant library for request routing in single page apps

## Usage

Spirr is framework-agnostic but requires a AMD loader to load the modules. Here's an example of a single page application using Dojo 1.7 (module loader, events and pub/sub):

`my/app.js`

    define([
        "sirprize/spirr/Request",
        "sirprize/spirr/Router",
        "sirprize/spirr/Route",
        "dojo/on",
        "dojo/topic",
        "dojo/domReady!"
    ], function(Request, Router, Route, on, topic) {

        var router = new Router(),

        handleState = function(router){
            var request = new Request(window.location.href);
            router.route(new Request(window.location.href));
            var route = router.getCurrentRoute();

            if(route) { route.callback(request); }
            else { console.log('no route found'); }
        };

        router.addRoute('home', new Route(
            '/home',
            function(request) { console.log('home'); }
        ));

        router.addRoute('products', new Route(
            '/products',
            function(request) { console.log('products'); }
        ));

        router.addRoute('product', new Route(
            '/products/:id',
            function(request) { console.log('product'); }
        ));

        // handle the browser back and forward buttons
        on(window, 'popstate', function (ev) {
            handleState(router);
        });

        // From within your app, publish a topic whenever state should be changed
        // This block checks for availability of the history API and takes appropriate action
        topic.subscribe('onPushState', function(pushStateArgs) {
            if (!(window.history && history.pushState)) {
                // not supported by browser - make the trip to server
                return window.location = pushStateArgs.url;
            }

            history.pushState(pushStateArgs.state, pushStateArgs.title, pushStateArgs.url);
            handleState(router);
        });

        // handle the initial state upon page load
        handleState(router);
    });

`index.html`

    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <title>home</title>

            <script>
                var dojoConfig = {
                    async: 1,
                    packages: [
                        { name: "sirprize/spirr", location: "/path/to/spirr/lib/sirprize/spirr" },
                        { name: 'my/app', location: '/path/to/my/app' }
                    ]
                };
            </script>

            <script src="/path/to/vendor/dojo/dojo.js"></script>

            <script>
                require(['my/app']);
            </script>
        </head>

        <body>
            <div id="page"></div>
        </body>
    </html>

## Running Tests In The Browser

+ Point your browser to `<spirr-dir>/tests/runner.html`

## License

See LICENSE.
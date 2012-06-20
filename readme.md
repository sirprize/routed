# Spirr (Single Page Interface Request Router)

Spirr is an AMD compliant library for request routing in single page apps

## Usage

Spirr is framework-agnostic but requires an AMD loader to load the modules. Here's an example of a single page application using Dojo 1.7 (module loading, history api detection, events and pub/sub):

`my/app.js`

    define([
        "sirprize/spirr/Request",
        "sirprize/spirr/Router",
        "sirprize/spirr/Route",
        "dojo/has",
        "dojo/on",
        "dojo/topic",
        "dojo/domReady!"
    ], function(Request, Router, Route, has, on, topic) {

        var router = Router(),

        handleState = function(router){
            var route = null, request = Request(window.location.href);
            router.route(request);
            route = router.getCurrentRoute();

            if(route) { route.callback(request); }
            else { console.log('no route found'); }
        };

        router.addRoute('home', Route(
            '/home',
            function(request) { console.log('home'); }
        ));

        router.addRoute('products', Route(
            '/products',
            function(request) { console.log('products'); }
        ));

        router.addRoute('product', Route(
            '/products/:id',
            function(request) { console.log('product'); }
        ));
        
        (function run(){
            // register history api detection
            has.add('native-history-state', function(g) {
                return ("history" in g) && ("pushState" in history);
            });
            
            // handle the browser back and forward buttons
            on(window, 'popstate', function (ev) {
                handleState(router);
            });
            
            // From within your app, publish a topic whenever state should be changed
            topic.subscribe('onPushState', function(args) {
                history.pushState(args.state, args.title, args.url);
                return handleState(router);
            });
            
            // handle the initial state upon page load
            handleState(router);
        })();
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
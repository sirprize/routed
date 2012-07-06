# Spirr (Single Page Interface Request Router)

AMD compliant library for request routing in single page apps

## Usage

Spirr maps urls to callback functions and provides the infrastructure to assemble urls based on your url schema.

## Request

The request object decomposes an url into it's parts and makes them available to your application

    var request = Request('/releases?sort=release-date&order=desc');
    var path = request.getPathname(); // returns '/releases'
    var params = request.getQueryParams() // returns { sort: 'release-date', order: 'desc' }

## Routes

Start by defining the routes for your application. A route consists of a schema to match against an url and a callback defining the action to be taken if matched. The schema can contain variable parts. Path variables start with ":"
    
    // a simple route
    var releases = Route('/releases', function(){
        // make releases page
    });

    // a route with variables - this will match urls such as /releases/ay-ay-ay
    var release = Route('/release/:release', function(){
        // make release page
    });

## Router

Now add the routes to the router. The router is responsible for finding a route on a given request. Path variables are injected into the request object

    var router = Router();
    router.addRoute('releases', releases);
    router.addRoute('release', release);
    
    // try to match the current request to a route
    var route = router.route(request);
    
    if(route) {
        // execute the route's callback function
        route.callback(request);
    }

## Url Assembling
    
Routes provide the infrastructure to assemble urls within your application

    var targetRoute = router.getRoute('release');
    var url = targetRoute.assemble({ release: 'ay-ay-ay' }); // return '/release/ay-ay-ay'

## Running Tests In The Browser

+ Point your browser to `<spirr-dir>/tests/runner.html`

## License

See LICENSE.
/*
* primary file for the API


*/

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// the server should respond to all requests with a string
//instantiate the http server

httpsServerOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pem'),
};

var httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
});

//instantiate the https server
var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
    unifiedServer(req, res);
});

// start the server and have it listen on port 3000
httpServer.listen(config.httpPort, function() {
    console.log(
        'server started on port ' +
            config.httpPort +
            ' in ' +
            config.envName +
            ' mode'
    );
});

httpsServer.listen(config.httpsPort, function() {
    console.log(
        'server started on port ' +
            config.httpsPort +
            ' in ' +
            config.envName +
            ' mode'
    );
});

//All the server logic for both servers
var unifiedServer = function(req, res) {
    //get the url and pass it

    var parsedUrl = url.parse(req.url, true);

    //get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //Get the query string as an object
    var queryStringObject = parsedUrl.query;

    //get the Http Method
    var method = req.method.toLowerCase();

    //get the headers as an object

    var headers = req.headers;

    //get the payload if present
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', function(data) {
        buffer += decoder.write(data);
    });

    req.on('end', function() {
        buffer += decoder.end();

        //Choose the handler this request should go to else choose not found
        var chosenHandler =
            typeof router[trimmedPath] !== 'undefined'
                ? router[trimmedPath]
                : handlers.notFound;

        //construct the data object to send to the router

        var data = {
            trimmedPath: trimmedPath,
            queryStringObject: queryStringObject,
            method: method,
            headers: headers,
            payload: buffer,
        };
        //route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload) {
            //use the status code calledBack by the handler or default to 200
            statusCode = typeof statusCode == 'number' ? statusCode : 200;

            //use the payload called back by the handler or return default status code
            payload = typeof payload == 'object' ? payload : {};

            //convert the payload to string

            var payloadString = JSON.stringify(payload);

            //send the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);

            res.end(payloadString);

            //log the request path
            console.log('Returned response:', statusCode, payloadString);
        });
    });
};

//define handlers
var handlers = {};

handlers.ping = function(data, callback) {
    callback(200);
};

//not found handler
handlers.notFound = function(data, callback) {
    callback(404);
};

//define a router
var router = {
    sample: handlers.sample,
    ping: handlers.ping,
};

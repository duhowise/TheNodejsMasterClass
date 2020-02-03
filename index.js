/*
* primary file for the API


*/

// Dependencies
var http = require("http");
var url = require("url");
// the server should respond to all requests with a string

var server = http.createServer(function(req, res) {
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





    //send the response
    res.end("Hello world\n");

    //log the request path
    console.log("Request received with the following headers:",headers);
});
// start the server and have it listen on port 3000
server.listen(3000, function ()
{
    console.log("server started on port 3000");
});

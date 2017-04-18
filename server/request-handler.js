var url = require('url');

/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var results = [
  {
    username: 'Jono',
    message: 'Do my bidding!',
    roomname: 'lobby',
    createdAt: 'Mon Apr 17 2017 21:16:46 GMT-0700 (PDT)',
    objectId: 0
  },
  {
    username: 'Bono',
    message: 'Bid my doing!',
    roomname: 'lobby',
    createdAt: 'Mon Apr 17 2017 21:17:24 GMT-0700 (PDT)',
    objectId: 1
  },
  {
    username: 'Pono',
    message: 'My bidding do!',
    roomname: 'lobby',
    createdAt: 'Mon Apr 17 2017 21:17:37 GMT-0700 (PDT)',
    objectId: 2
  }
];

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var requestHandler = function(request, response) {
  // request.on('error', function(err) {
  //   console.error(err);
  //   response.statusCode = 400;
  //   response.end();
  // });
  // response.on('error', function(err) {
  //   console.error(err);
  // });

  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.

  var method = request.method;
  var urlParts = url.parse(request.url, true);
  var pathname = urlParts.pathname;

  console.log('Serving request type ' + method + ' for url ' + pathname);

  if (method === 'GET' && pathname === '/') {
    // The outgoing status.
    var statusCode = 200;

    // See the note below about CORS headers.
    var headers = defaultCorsHeaders;

    // Tell the client we are sending them plain text.
    //
    // You will need to change this if you are sending something
    // other than plain text, like JSON or HTML.
    headers['Content-Type'] = 'text/plain';

    // .writeHead() writes to the request line and headers of the response,
    // which includes the status and all headers.
    response.writeHead(statusCode, headers);

    // Make sure to always call response.end() - Node may not send
    // anything back to the client until you do. The string you pass to
    // response.end() will be the body of the response - i.e. what shows
    // up in the browser.
    //
    // Calling .end "flushes" the response's internal buffer, forcing
    // node to actually send all the data over to the client.
    response.end('Hello, World!');
  } if (method === 'OPTIONS' && pathname === '/classes/messages') {
    response.writeHead(200, defaultCorsHeaders);
    response.end();
  } else if (method === 'GET' && pathname === '/classes/messages') {
    var query = urlParts.query;
    var statusCode = 200;
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = 'application/json';


    for (var key in query) {
      if (key === 'order') {
        var order = query[key][0];
        var keyToSort = query[key].slice(1);
        if (order === '-' && keyToSort === 'createdAt') {
          var sortedResults = results.sort(function(a, b) {
            var dateA = new Date(a.createdAt);
            var dateB = new Date(b.createdAt);
            return dateB - dateA;
          });
        }
      }
    }

    var responseBody = {};

    if (sortedResults === undefined) {
      responseBody.results = results;
    } else {
      responseBody.results = sortedResults;
    }

    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(responseBody));

  } else if (method === 'POST' && pathname === '/classes/messages') {
    var statusCode = 201;
    var headers = defaultCorsHeaders;

    request.on('data', function(chunk) {
      var lastMessageId = results[results.length - 1].objectId;
      var message = JSON.parse(chunk.toString());

      message.objectId = lastMessageId + 1;
      message.createdAt = new Date().toString();

      results.push(message);
    });
    request.on('end', function() {
      var responseBody = results;

      response.writeHead(statusCode, headers);
      response.end(JSON.stringify(responseBody));

    });
  } else {
    response.statusCode = 404;
    response.end();
  }
};

exports.requestHandler = requestHandler;

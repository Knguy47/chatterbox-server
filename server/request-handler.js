var url = require('url');
var fs = require('fs');

// var results = [
//   {
//     username: 'Jono',
//     message: 'Do my bidding!',
//     roomname: 'lobby',
//     createdAt: 'Mon Apr 17 2017 21:16:46 GMT-0700 (PDT)',
//     objectId: 0
//   },
//   {
//     username: 'Bono',
//     message: 'Bid my doing!',
//     roomname: 'lobby',
//     createdAt: 'Mon Apr 17 2017 21:17:24 GMT-0700 (PDT)',
//     objectId: 1
//   },
//   {
//     username: 'Pono',
//     message: 'My bidding do!',
//     roomname: 'lobby',
//     createdAt: 'Mon Apr 17 2017 21:17:37 GMT-0700 (PDT)',
//     objectId: 2
//   }
// ];

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

  var method = request.method;
  var urlParts = url.parse(request.url, true);
  var pathname = urlParts.pathname;

  console.log('Serving request type ' + method + ' for url ' + pathname);

  if (method === 'GET' && pathname === '/') {
    var statusCode = 200;
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = 'text/plain';
    response.writeHead(statusCode, headers);
    response.end('Hello, World!');

  } if (method === 'OPTIONS' && pathname === '/classes/messages') {
    response.writeHead(200, defaultCorsHeaders);
    response.end();
  } else if (method === 'GET' && pathname === '/classes/messages') {
    var query = urlParts.query;
    var statusCode = 200;
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = 'application/json';

    fs.readFile(__dirname + '/messages.txt', 'utf8', function(err, data) {
      if (err) {
        response.statusCode = 404;
        response.end();
      } else {
        var results = JSON.parse(data);

        for (var key in query) {
          if (key === 'order') {
            var order = query[key][0];
            var keyToSort = query[key].slice(1);
            if (order === '-' && keyToSort === 'createdAt') {
              var resultsCopy = JSON.parse(JSON.stringify(results));
              var sortedResults = resultsCopy.sort(function(a, b) {
                var dateA = new Date(a.createdAt);
                var dateB = new Date(b.createdAt);
                return dateB - dateA;
              });
            } else if (order === '+' && keyToSort === 'createdAt') {
              var resultsCopy = JSON.parse(JSON.stringify(results));
              var sortedResults = resultsCopy.sort(function(a, b) {
                var dateA = new Date(a.createdAt);
                var dateB = new Date(b.createdAt);
                return dateA - dateB;
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
      }
    });

  } else if (method === 'POST' && pathname === '/classes/messages') {
    var statusCode = 201;
    var headers = defaultCorsHeaders;

    request.on('data', function(chunk) {
      fs.readFile(__dirname + '/messages.txt', 'utf8', function(err, data) {
        if (err) {
          response.statusCode = 404;
          response.end();
        } else {
          var results = JSON.parse(data);
          var lastMessageId = results[results.length - 1].objectId;
          var message = JSON.parse(chunk.toString());

          message.objectId = lastMessageId + 1;
          message.createdAt = new Date().toString();

          results.push(message);

          fs.writeFile(__dirname + '/messages.txt', JSON.stringify(results), function(err) {
            if (err) {
              throw err;
              console.log('File did not write');
            }
          });
        }
      });
    });
    request.on('end', function() {
      fs.readFile(__dirname + '/messages.txt', 'utf8', function(err, data) {
        if (err) {
          response.statusCode = 404;
          response.end();
        } else {
          var responseBody = JSON.parse(data);

          response.writeHead(statusCode, headers);
          response.end(JSON.stringify(responseBody));
        }
      });
    });
  } else {
    response.statusCode = 404;
    response.end();
  }
};

exports.requestHandler = requestHandler;

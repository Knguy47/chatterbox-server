var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var messages = [];

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.get('/classes/messages', function(req, res) {
  res.json({
    results: messages
  });
});

app.post('/', function(req, res) {
  res.status(201).send('Got your request');
});

app.post('/classes/messages', function(req, res) {
  messages.push(req.body);

  res.status(201).json({
    results: messages
  });
});

app.listen(3000, function() {
  console.log('App listening on port 3000!');
});

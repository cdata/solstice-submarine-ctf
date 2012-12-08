var requirejs = require('requirejs');
var express = require('express');
var http = require('http');
var uuid = require('node-uuid');
var socket = require('socket.io');
var persona = require('express-persona');
var app = express();
var server = http.createServer(app);
var io = socket.listen(server);
var gameQueue = [];
var games = {};

server.listen(9001);

app.enable('trust proxy')
  .use(express.bodyParser())
  .use(express.cookieParser())
  .use(express.session({
    secret: 'solsticesub'
  }))
  .use(express.static('static'));

persona(app, {
  //audience: 'https://solsticesub.com'
  audience: 'http://localhost:9001'
});

requirejs.config({
  baseUrl: './static/javascripts',
  paths: {
    'tween': 'support/tween',
    'instance': '../../lib/instance'
  },
  shim: {
    'tween': {
      exports: 'TWEEN'
    }
  }
});

console.log('It\'s too late to apologize..');

io.set('transports', ['xhr-polling']);
io.sockets.on('connection', function(connection) {

  var other;
  var instance;

  console.log('Connection!');

  if (gameQueue.length) {
    other = gameQueue.pop();

    requirejs(['instance'], function(Instance) {
      instance = new Instance({
        clientOne: other,
        clientTwo: connection
      });

      instance.on('ended', function() {
        games[instance.id] = null;
        instance.dispose();
      });

      games[instance.id] = instance;
    });
  } else {
    gameQueue.push(connection);
    console.log('Queued connection. Queue length is', gameQueue.length);

    connection.on('disconnect', function() {

      console.log('Disconnected!');

      var index;
      var other;

      for (index = 0; index < gameQueue.length; ++index) {
        other = gameQueue[index];
        if (connection === other) {
          gameQueue.splice(index, 1);
          return;
        }
      }
    });
  }
});

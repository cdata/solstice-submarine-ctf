var express = require('express');
var http = require('http');
var socket = require('socket.io');
var persona = require('express-persona');
var app = express();
var server = http.createServer(app);
var io = socket.listen(server);
var gameQueue = [];

server.listen(9001);

app.enable('trust proxy')
  .use(express.bodyParser())
  .use(express.cookieParser())
  .use(express.session({
    secret: 'solsticesub'
  }))
  .use(express.static('static'));

persona(app, {
  audience: 'https://solsticesub.com'
});

io.set('transports', ['xhr-polling']);
io.sockets.on('connection', function(connection) {
  console.log('Connection!');
});

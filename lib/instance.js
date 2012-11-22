var _ = require('underscore');
var arbiter = require('./game/arbiter');

exports = module.exports = function Instance(clientOne, clientTwo) {
  this.clientOne = clientOne;
  this.clientTwo = clientTwo;
};

Instance.prototype.listen = function() {
  [this.clientOne, this.clientTwo].forEach(function(client) {
    //client.on('turn'
  }, this);
};

var _ = require('underscore');
var uuid = require('node-uuid');
var Backbone = require('backbone');
var requirejs = require('requirejs');
var define = requirejs.define;

define(['game/object', 'game/arbiter', 'model/game/fork', 'model/game/instance'],
       function(GameObject, Arbiter, Fork, InstanceModel) {

  var Instance = GameObject.extend({
    initialize: function(options) {
      this.id = uuid.v4();
      this.model = new InstanceModel({
        subClient: options.clientOne,
        rktClient: options.clientTwo
      });
      this.clientOne = options.clientOne;
      this.clientTwo = options.clientTwo;
      this.clients = [options.clientOne, options.clientTwo];
      this.listen();
      this.start();
    },
    listen: function() {
      this.clients.forEach(function(client) {
        client.on('turn', this.onClientTurn, this);
      }, this);
    },
    start: function() {
      this.clientOne.emit('start', 'sub');
      this.clientTwo.emit('start', 'rkt');
    },
    onClientTurn: function() {
      console.log(JSON.stringify(arguments));
    },
    validateMoves: function() {

    }
  });

  _.extend(Instance.prototype, Backbone.Events);
  console.log('Instance is exported');
  //exports = module.exports = Instance;
  return Instance;
});


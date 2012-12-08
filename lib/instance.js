var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');
var Backbone = require('backbone');
var requirejs = require('requirejs');
var define = requirejs.define;

define(['game/object', 'game/arbiter', 'model/game/fork', 'model/game/instance', 'model/game/move', 'game/vector2'],
       function(GameObject, Arbiter, Fork, InstanceModel, MoveModel, Vector2) {
  var map = JSON.parse(fs.readFileSync(path.resolve('./static/assets/data/maps/seabound.json')));
  var Instance = GameObject.extend({
    initialize: function(options) {
      this.id = uuid.v4();
      this.model = new InstanceModel({
        subClient: options.clientOne,
        rktClient: options.clientTwo,
        subFork: new Fork({
          origin: new Vector2(0, 4),
          position: new Vector2(0, 4),
          team: 'sub'
        }),
        rktFork: new Fork({
          origin: new Vector2(17, 4),
          position: new Vector2(17, 4),
          team: 'rkt'
        })
      });
      this.listen();
      this.start();
    },
    listen: function() {
      this.model.on('change:rktNextMove change:subNextMove', this.resolveMoves, this);
      this.model.get('subClient').on('turn', _.bind(this.onClientTurn, this, 'sub'));
      this.model.get('rktClient').on('turn', _.bind(this.onClientTurn, this, 'rkt'));
    },
    start: function() {
      this.model.get('subClient').emit('start', 'sub');
      this.model.get('rktClient').emit('start', 'rkt');
    },
    onClientTurn: function(team, data, callback) {
      var move;

      if (callback) {
        callback();
      }

      if (this.model.get(team + 'NextMove') === null) {
        console.log('Got turn data for', team, ':', data);

        moveA = new MoveModel(data[0]);
        moveB = new MoveModel(data[1]);

        this.model.set(team + 'NextMove', [moveA, moveB]);
      }
    },
    resolveMoves: function() {
      var nextRktMove = this.model.get('rktNextMove');
      var nextSubMove = this.model.get('subNextMove');
      var result;

      if (!nextRktMove || !nextSubMove) {
        return;
      }

      console.log('Resolving outcomes..');

      this.model.set({
        'rktNextMove': null,
        'subNextMove': null
      }, { silent: true });

      this.model.get('rktClient').emit('resolving');
      this.model.get('subClient').emit('resolving');

      result = Arbiter.resolve(nextSubMove.concat(nextRktMove),
                               [this.model.get('subFork'), this.model.get('rktFork')],
                               map);

      result = JSON.stringify(result);

      this.model.get('subClient').emit('outcome', result);
      this.model.get('rktClient').emit('outcome', result);
    }
  });

  _.extend(Instance.prototype, Backbone.Events);

  return Instance;
});


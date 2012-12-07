if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define(['underscore', 'backbone', 'game/vector2', 'model/game/move'],
       function(_, Backbone, Vector2, Move) {
  var Outcome = Backbone.Model.extend({
    defaults: {
      unit: Move.unit.SUB_A,
      type: 'move',
      target: null,
      position: null,
      points: [],
      scoreDelta: 0,
      interrupted: false
    },
    get: function(attribute) {
      if (attribute === 'points') {
        return _.map(Backbone.Model.prototype.get.apply(this, arguments), function(point) {
          return new Vector2(point.x, point.y);
        });
      }
      return Backbone.Model.prototype.get.apply(this, arguments);
    }
  }, {
    type: {
      MOVE: 'move',
      MOVE_SHIELDED: 'move-shielded',
      WAIT: 'wait',
      ATTACK: 'attack',
      DEFEND: 'defend',
      DIE: 'die',
      RESPAWN: 'respawn',
      DROP_FORK: 'drop-fork',
      PICKUP_FORK: 'pickup-fork',
      RETURN_FORK: 'return-fork',
      CAPTURE_FORK: 'capture-fork'
    }
  });

  return Outcome;
});

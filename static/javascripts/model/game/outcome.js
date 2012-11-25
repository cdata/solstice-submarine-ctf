if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define('model/game/outcome',
       ['underscore', 'backbone', 'game/vector2', 'model/game/move'],
       function(_, Backbone, Vector2, Move) {
  var Outcome = Backbone.Model.extend({
    defaults: {
      unit: Move.unit.SUB_A,
      type: function() {
        return Outcome.type.MOVE;
      },
      points: [],
      scoreDelta: 0
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
      DIE: 'die',
      RELOCATE: 'relocate'
    }
  });

  return Outcome;
});

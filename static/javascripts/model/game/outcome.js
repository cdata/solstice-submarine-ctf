if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define('model/game/outcome',
       ['underscore', 'backbone', 'game/vector2'],
       function(_, Backbone, Vector2) {
  return Backbone.Model.extend({
    defaults: {
      unit: 'subA',
      points: null,
      dies: false,
      attacks: null,
      scoreDelta: 0,
      shielded: false
    },
    addPointFromMove: function(move) {
      var points = this.get('points');
      var movePoints = move.get('points');
      // TODO: Validation?
      points.push(movePoints[points.lenth]);
    },
    getCurrentDirection: function() {
      //var result 
    },
    get: function(attribute) {
      if (attribute === 'points') {
        return _.map(Backbone.Model.prototype.get.apply(this, arguments), function(point) {
          return new Vector2(point.x, point.y);
        });
      }
      return Backbone.Model.prototype.get.apply(this, arguments);
    }
  });
});

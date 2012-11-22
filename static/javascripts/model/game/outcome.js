if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define('model/game/outcome',
       ['backbone'],
       function(Backbone) {
  return Backbone.Model.extend({
    defaults: {
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
    }
  });
});

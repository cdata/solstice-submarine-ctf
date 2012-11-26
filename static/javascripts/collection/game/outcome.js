define('collection/game/outcome',
       ['backbone', 'model/game/outcome'],
       function(Backbone, Outcome) {
  return Backbone.Collection.extend({
    model: Outcome,
    getLastOutcome: function() {
      try {
        return this.at(this.length - 1);
      } catch(e) {}
    },
    getTotalMoves: function() {
      return this.reduce(function(positions, model) {
        return positions + model.get('points').length;
      }, 0);
    },
    getLastRecordedPosition: function() {
      var index = this.length - 1;
      var position;
      var points;
      var model;

      while (!position && index > -1) {
        model = this.at(index);
        points = model.get('points');
        position = points[points.length - 1];
      }

      return position;
    },
    unitDiedAtSomePoint: function() {
      var index = this.length;
      var model;

      while (model = this.at(--index)) {
        if (model.get('type') === Outcome.type.DIE) {
          return true;
        }
      }

      return false;
    },
    unitIsWaiting: function() {
      var lastOutcome = this.last();
      return lastOutcome && lastOutcome.get('type') === Outcome.type.WAIT;
    },
    unitIsDead: function() {
      return this.unitDiedAtSomePoint();
    },
    unitIsAlive: function() {
      return !this.unitIsDead();
    }
  });
});

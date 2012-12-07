if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define('collection/game/outcome',
       ['backbone', 'model/game/outcome', 'game/vector2'],
       function(Backbone, Outcome, Vector2) {
  return Backbone.Collection.extend({
    model: Outcome,
    unitIsCompanion: function(unitType) {
      return this.getUnitType().substr(0, 3) === unitType.substr(0, 3);
    },
    getUnitType: function() {
      return this.getLastOutcome().get('unit');
    },
    getLastOutcome: function(relativeOutcomes) {
      var index;

      if (relativeOutcomes) {
        index = relativeOutcomes.length;
      } else {
        index = this.length;
      }

      try {
        return this.at(index - 1);
      } catch(e) {}
    },
    getTotalMoves: function() {
      return this.reduce(function(positions, model) {
        var additional = 0;

        if (model.get('type') === Outcome.type.MOVE ||
            model.get('type') === Outcome.type.MOVE_SHIELDED) {
          additional += model.get('points').length;
        }
        return positions + additional;
      }, 0);
    },
    getLastRecordedDirection: function() {
      var index = this.length;
      var previousPosition;
      var position;
      var start;
      var points;
      var model;
      var direction;

      while (!position && !previousPosition && index > 0) {
        model = this.at(--index);

        if (model.get('type') !== Outcome.type.MOVE &&
            model.get('type') !== Outcome.type.MOVE_SHIELDED) {
          continue;
        }

        points = model.get('points');
        start = model.get('position');
        position = points[points.length - 1];
        previousPosition = points[points.length - 2] || start;
      }

      if (!position || !previousPosition) {
        return new Vector2();
      }

      return position.clone().subtract(previousPosition).normalize();
    },
    getLastRecordedPosition: function() {
      var index = this.length;
      var position;
      var points;
      var model;

      while (!position && index > 0) {
        model = this.at(--index);

        if (model.get('type') !== Outcome.type.MOVE &&
            model.get('type') !== Outcome.type.MOVE_SHIELDED) {
          continue;
        }

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
    unitIsShielded: function() {
      var index = this.length;
      var model;

      while (model = this.at(--index)) {
        if (model.get('type') === Outcome.type.MOVE_SHIELDED) {
          return true;
        }
      }

      return false;
    },
    unitIsInterrupted: function() {
      var lastOutcome = this.last();
      return lastOutcome && lastOutcome.get('interrupted');
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

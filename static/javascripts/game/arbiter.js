if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define('game/arbiter',
       ['underscore', 'model/game/outcome', 'collection/game/outcome', 'game/vector2', 'game/world'],
       function(_, Outcome, OutcomeCollection, Vector2, World) {
  function direction(from, to) {
    // returns direction given a move from one pos to another
    return from.clone().subtract(to).normalize();
  }

  function cardinal(direction) {
    var x = Math.abs(direction.x);
    var y = Math.abs(direction.y);
    return (x === 1 && y === 0) || (x === 0 && y === 1);
  }

  function lineOfSight(from, to, map, maxDistance) {
    // returns true if from has cardinal line of sight with to on map
    var direction = direction(from, to);
    var iter = from.clone();
    var index;
    var tileValue;

    if (!cardinal(direction)) {
      return false;
    }

    while (!iter.equals(to)) {
      index = World.prototype.positionToIndex.call(
          { width: map.width, height: map.height }, iter);
      tileValue = map.tiles[index];

      if (tileValue & World.tile.WALL) {
        return false;
      }

      iter.add(direction);
    }

    return true;
  }

  function moveCompleted(move, outcomes) {
    return move.get('points').length > outcome.get('points').length && !outcome.get('dies') && !outcome.get('attacks');
  }

  function hasMove(moves, outcomeList) {
    return _.any(moves, function(move, index) {
      var outcomes = outcomeList[index];
      var lastOutcome = outcomes.getLastOutcome();
      var lastPosition = outcomes.getLastRecordedPosition();
      return !moveCompleted(move, outcomes);
    });
  }

  function advance(move, outcome) {
    var lastOutcome = outcome.getLastOutcome();

    if (!lastOutcome) {
      lastOutcome = new Outcome({
        unit: move.get('unit')
      });
      outcome.push(lastOutcome);
    }

    if (!moveCompleted(move, outcome)) {
      outcome.addPointFromMove(move);
    }
  }

  function advanceAll(moves, outcomes) {
    _.each(moves, function(move, index) {
      advance(move, outcomes[index]);
    });
  }

  function checkStateOf(move, outcome, map) {

  }

  function checkStateOfAll(moves, outcomes, map) {
    _.each(moves, function(move, index) {
      var outcome = outcomes[index];
      checkStateOf(move, outcome, map);
    });
  }

  function resolve(moves, forks, map) {
    var p1OutcomeA = new OutcomeCollection();
    var p1OutcomeB = new OutcomeCollection();
    var p2OutcomeA = new OutcomeCollection();
    var p2OutcomeB = new OutcomeCollection();
    var outcomes = [ p1OutcomeA, p1OutcomeB, p2OutcomeA, p2OutcomeB ];

    while (hasMove(moves, outcomes)) {
      advanceAll(moves, outcomes);
      checkStateOfAll(moves, outcomes, map);
    }

    return outcomes;
  }

  return {
    resolve: resolve
  };
});

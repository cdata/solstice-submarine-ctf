if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define('game/arbiter',
       ['underscore', 'model/game/outcome', 'collection/game/outcome', 'game/vector2', 'game/world'],
       function(_, Outcome, OutcomeCollection, Vector2, World) {

  // Utility. Returns direction given a move from one pos to another.
  function direction(from, to) {
    return from.clone().subtract(to).normalize();
  }

  // Utility. Returns true if vectors are facing the same direction.
  function sameDirection(alpha, beta) {
    return alpha.clone().normalize().equals(beta.clone().normalize());
  }

  // Utility. Returns true if the direction is a 'cardinal' direction (up, down, left, right).
  function cardinal(direction) {
    var x = Math.abs(direction.x);
    var y = Math.abs(direction.y);
    return (x === 1 && y === 0) || (x === 0 && y === 1);
  }

  // Utility. Returns true of there is cardinal line of sight from one point to another on map,
  // constrained by maxDistance.
  function lineOfSight(from, to, map, maxDistance) {
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

  function resolve(moveList, forks, map) {
    var subOutcomeA = new OutcomeCollection();
    var subOutcomeB = new OutcomeCollection();
    var rktOutcomeA = new OutcomeCollection();
    var rktOutcomeB = new OutcomeCollection();
    var outcomeList = [ subOutcomeA, subOutcomeB, rktOutcomeA, rktOutcomeB ];

    while (someoneCanMove(moveList, outcomeList)) {
      while (someoneCanMove(moveList, outcomeList)) {
        advanceAll(moveList, outcomeList, forks, map);
      }
      resolveActionsForAll(moveList, outcomeList, forks, map);
    }

    respawnDeadUnits(moveList, outcomeList);

    return outcomeList;
  }

  function someoneCanMove(moveList, outcomeList) {
    return _.any(moveList, function(move, index) {
      var outcomes = outcomeList[index];
      return canPerformMovement(move, outcomes);
    });
  }

  function canPerformMovement(move, outcomes) {
    var movesSoFar = outcomes.getTotalMoves();
    var hasMoreMoves = movesSoFar < move.get('points').length;
    var waiting = outcomes.unitIsWaiting();
    var alive = outcomes.unitIsAlive();

    return alive && hasMoreMoves && !waiting;
  }

  // An outcome collection is incomplete if the last outcome is not 'finished-turn'..
  function waiting(outcomes) {
    var lastOutcome = outcomes.getLastOutcome();
    return lastOutcome && lastOutcome.get('type') === Outcome.type.WAIT;
  }

  // Advance all incomplete outcomes one tick..
  function advanceAll(moveList, outcomeList, forks, map) {
    _.each(moveList, function(move, index) {
      var outcomes = outcomeList[index];
      advance(move, outcomes, forks, map);
      checkLineOfSight(outcomes, _.without(outcomeList, outcomes), forks, map);
    });
  }

  function advance(move, outcomes, forks, map) {
    if (!canPerformMovement(move, outcomes)) {
      // You can (not) advance.
      return;
    }

    var lastOutcome;
    var lastOutcomePoints;
    var movesSoFar;

    lastOutcome = outcomes.getLastOutcome();

    if (!lastOutcome) {
      // If we haven't moved, we need at least one move outcome..
      lastOutcome = new Outcome({
        unit: move.get('unit'),
        type: move.get('shielded') ? Outcome.type.MOVE_SHIELDED : Outcome.type.MOVE
      });
      outcomes.push(lastOutcome);
    }

    movesSoFar = outcomes.getTotalMoves();

    lastOutcomePoints = lastOutcome.get('points');
    lastOutcomePoints.push(move.get('points')[movesSoFar]);
    lastOutcome.set('points', lastOutcomePoints);
  }

  function checkLineOfSight(outcomes, othersOutcomeList, forks, map) {
    _.each(othersOutcomeList, function(othersOutcomes) {
      var alive = outcomes.unitIsAlive();
      var otherIsAlive = othersOutcomes.unitIsAlive();
      var position;
      var otherPosition;

      if (!(alive && otherIsAlive)) {
        // The dead can not see.
        return;
      }

      // TODO: Check line of sight..
    });
  }

  function resolveActionsForAll(moveList, outcomeList, forks, map) {

  }

  function checkStateOfAll(moveList, outcomeList, forks, map) {
    _.each(moveList, function(move, index) {
      var outcome = outcomeList[index];
      checkStateOf(move, outcome, _.without(outcomeList, outcome), forks, map);
    });
  }

  function checkStateOf(move, outcomes, othersOutcomeList, forks, map) {
    var alive;
    var movesSoFar;

    _.each(othersOutcomeList, function(othersOutcomes) {

      checkStateAgainst(move, outcomes, othersOutcomes, forks, map);
    });

    alive = outcomes.unitIsAlive();
    movesSoFar = outcomes.getTotalMoves();

    if (!(alive && movesSoFar < move.get('points').length)) {
      outcomes.push(new Outcome({
        unit: move.get('unit'),
        type: Outcome.type.WAIT
      }));
    }
  }

  function checkStateAgainst(move, outcomes, othersOutcomes, forks, map) {
  }

  function respawnDeadUnits(moveList, outcomeList) {
    _.each(moveList, function(move, index) {
      var outcomes = outcomeList[index];
      if (outcomes.unitDiedAtSomePoint()) {
        outcomes.push(new Outcome({
          unit: move.get('unit'),
          type: Outcome.type.RESPAWN
        }));
      }
    });
  }

  return {
    resolve: resolve
  };
});

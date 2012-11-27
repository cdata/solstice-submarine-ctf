if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define('game/arbiter',
       ['underscore', 'model/game/outcome', 'collection/game/outcome', 'game/vector2', 'game/world'],
       function(_, Outcome, OutcomeCollection, Vector2, World) {

  // Utility. Returns direction given a move from one pos to another.
  function directionAcross(from, to) {
    return to.clone().subtract(from).normalize();
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
    var direction = directionAcross(from, to);
    var iter = from.clone();
    var distance = 0;
    var tileValue;
    var index;

    if (typeof maxDistance === 'undefined') {
      maxDistance = 5;
    }

    if (!cardinal(direction)) {
      return false;
    }

    while (!iter.equals(to)) {
      if (distance > maxDistance) {
        return false;
      }

      index = World.prototype.positionToIndex.call(
          { width: map.width, height: map.height }, iter);
      tileValue = map.tiles[index];

      if (tileValue & World.tile.WALL) {
        return false;
      }

      iter.add(direction);
      ++distance;
    }

    return true;
  }


  function someoneCanMove(moveList, outcomeList) {
    return _.any(moveList, function(move, index) {
      var outcomes = outcomeList[index];
      return canPerformMovement(move, outcomes);
    });
  }

  function canPerformMovement(move, outcomes) {
    var lastOutcome = outcomes.getLastOutcome();
    var movesSoFar = outcomes.getTotalMoves();
    var hasMoreMoves = movesSoFar < move.get('points').length;
    var waiting = outcomes.unitIsWaiting();
    var alive = outcomes.unitIsAlive();
    var interrupted = lastOutcome && lastOutcome.get('interrupted');

    return alive && hasMoreMoves && !waiting && !interrupted;
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
    });
  }

  // Advance one unit one tick..
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
        position: move.get('start'),
        type: move.get('shielded') ? Outcome.type.MOVE_SHIELDED : Outcome.type.MOVE
      });
      outcomes.push(lastOutcome);
    }

    movesSoFar = outcomes.getTotalMoves();

    lastOutcomePoints = lastOutcome.get('points');
    lastOutcomePoints.push(move.get('points')[movesSoFar]);
    lastOutcome.set('points', lastOutcomePoints);
  }

  function interruptAnyInConflict(moveList, outcomeList, forks, map) {
    _.each(moveList, function(move, index) {
      var outcomes = outcomeList[index];
      var othersOutcomeList = _.without(outcomeList, outcomes);
      _.each(othersOutcomeList, function(othersOutcomes) {
        if (outcomes.unitIsCompanion(othersOutcomes.getUnitType())) {
          // Line of sight between companions is disregarded
          return;
        }

        var interrupted = outcomes.unitIsInterrupted();
        var lastOutcome;
        var othersLastOutcome;

        if (!interrupted && unitHasSightOfOther(outcomes, othersOutcomes, forks, map)) {
          // Interrupt both units
          lastOutcome = outcomes.getLastOutcome();
          othersLastOutcome = othersOutcomes.getLastOutcome();
          lastOutcome.set('interrupted', true);
          othersLastOutcome.set('interrupted', true);
        }
      });
    });
  }

  function unitHasSightOfOther(outcomes, othersOutcomes, forks, map) {
    var alive = outcomes.unitIsAlive();
    var otherIsAlive = othersOutcomes.unitIsAlive();
    var position;
    var otherPosition;
    var direction;

    if (!(alive && otherIsAlive)) {
      // The dead can not see.
      return false;
    }

    position = outcomes.getLastRecordedPosition();
    otherPosition = othersOutcomes.getLastRecordedPosition();

    direction = outcomes.getLastRecordedDirection();

    if (sameDirection(directionAcross(position, otherPosition), direction) &&
        lineOfSight(position, otherPosition, map, 5)) {
      return true;
    }

    return false;
  }

  function resolveAttacksForAll(moveList, outcomeList, forks, map) {
    _.each(moveList, function(move, index) {
      var outcomes = outcomeList[index];
      var othersOutcomeList = _.without(outcomeList, outcomes);
      var alive = outcomes.unitIsAlive();
      var attacking = false;

      _.each(othersOutcomeList, function(othersOutcomes) {
        if (!alive || attacking) {
          return;
        }

        if (unitHasSightOfOther(outcomes, othersOutcomes, forks, map)) {
          attacking = true;
          outcomes.push(new Outcome({
            type: Outcome.type.ATTACK,
            target: othersOutcomes.getUnitType(),
            position: outcomes.getLastRecordedPosition(),
            points: [othersOutcomes.getLastRecordedPosition()],
            unit: move.get('unit')
          }));
        }
      });

      if (!alive || !attacking) {
        outcomes.push(new Outcome({
          type: Outcome.type.WAIT,
          position: outcomes.getLastRecordedPosition(),
          unit: move.get('unit')
        }));
      }
    });
  }

  function resolveDefenseForAll(moveList, outcomeList, forks, map) {
    _.each(moveList, function(move, index) {
      var outcomes = outcomeList[index];
      var othersOutcomeList = _.without(outcomeList, outcomes);
      var alive = outcomes.unitIsAlive();
      var waiting = outcomes.unitIsWaiting();
      var attacking = outcomes.getLastOutcome().get('type') === Outcome.type.ATTACK;
      var defending = false;
      var dying = false;

      _.each(othersOutcomeList, function(othersOutcomes) {
        if (!alive || defending || dying) {
          return;
        }

        var othersLastOutcome = othersOutcomes.getLastOutcome();
        var othersTarget;

        if (othersLastOutcome.get('type') !== Outcome.type.ATTACK) {
          return;
        }

        othersTarget = othersLastOutcome.get('target');

        if (othersTarget !== move.get('unit')) {
          return;
        }

        if (outcomes.unitIsShielded()) {
          defending = true;
          outcomes.push(new Outcome({
            type: Outcome.type.DEFEND,
            position: outcomes.getLastRecordedPosition(),
            unit: outcomes.getUnitType()
          }));
        } else {
          dying = true;
          outcomes.push(new Outcome({
            type: Outcome.type.DIE,
            position: outcomes.getLastRecordedPosition(),
            unit: outcomes.getUnitType()
          }));
        }
      });

      if (!alive || !(defending || dying)) {
        outcomes.push(new Outcome({
          type: Outcome.type.WAIT,
          position: outcomes.getLastRecordedPosition(),
          unit: outcomes.getUnitType()
        }));
      }
    });
  }

  function restartAllInterrupted(moveList, outcomeList, forks, map) {
    _.each(moveList, function(move, index) {
      var outcomes = outcomeList[index];

    });
  }

  function respawnDeadUnits(moveList, outcomeList) {
    _.each(moveList, function(move, index) {
      var outcomes = outcomeList[index];
      if (outcomes.unitDiedAtSomePoint()) {
        outcomes.push(new Outcome({
          unit: move.get('unit'),
          type: Outcome.type.RESPAWN
        }));
      } else {
        outcomes.push(new Outcome({
          unit: move.get('unit'),
          type: Outcome.type.WAIT,
          position: outcomes.getLastRecordedPosition()
        }));
      }
    });
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
        interruptAnyInConflict(moveList, outcomeList, forks, map);
      }
      resolveAttacksForAll(moveList, outcomeList, forks, map);
      resolveDefenseForAll(moveList, outcomeList, forks, map);
      restartAllInterrupted(moveList, outcomeList, forks, map);
    }

    respawnDeadUnits(moveList, outcomeList);

    return outcomeList;
  }

  return {
    resolve: resolve
  };
});

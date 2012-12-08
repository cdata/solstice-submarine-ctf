if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define(['underscore', 'model/game/outcome', 'collection/game/outcome', 'game/vector2', 'game/world'],
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

    return alive && hasMoreMoves && !interrupted;
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
      var lastOutcome = outcomes.getLastOutcome();
      var othersLastOutcome;
      var interrupted;

      _.each(othersOutcomeList, function(othersOutcomes) {
        if (outcomes.unitIsCompanion(othersOutcomes.getUnitType())) {
          // Line of sight between companions is disregarded
          return;
        }

        interrupted = outcomes.unitIsInterrupted();

        if (!interrupted && (unitHasSightOfOther(outcomes, othersOutcomes, forks, map))) {
          // Interrupt both units
          othersLastOutcome = othersOutcomes.getLastOutcome();
          lastOutcome.set('interrupted', true);
          othersLastOutcome.set('interrupted', true);
        }
      });

      if (!interrupted && unitCanHandleFork(outcomes, forks, map)) {
        lastOutcome.set('interrupted', true);
      }
    });
  }

  function unitCanHandleFork(outcomes, forks, map) {
    var details = forkDetails(outcomes, forks);

    return (details.standingOverOtherFork ||
            (details.standingOverMyFork &&
             (details.carrying ||
              !details.lastPosition.equals(details.myFork.get('origin'))))) &&
           details.alive;
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
      var shielded = outcomes.unitIsShielded();
      var attacking = false;

      _.each(othersOutcomeList, function(othersOutcomes) {
        if (!alive || attacking || shielded) {
          return;
        }

        if (outcomes.unitIsCompanion(othersOutcomes.getUnitType())) {
          return;
        }

        if (unitHasSightOfOther(outcomes, othersOutcomes, forks, map)) {
          attacking = true;
          outcomes.push(new Outcome({
            type: Outcome.type.ATTACK,
            target: othersOutcomes.getUnitType(),
            position: outcomes.getLastRecordedPosition(),
            points: [othersOutcomes.getLastRecordedPosition()],
            unit: move.get('unit'),
            score: othersOutcomes.unitIsShielded() ? 0 : 2
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

        var othersLastOutcome = othersOutcomes.getLastOutcome(outcomes);
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
            unit: outcomes.getUnitType(),
            score: 1
          }));
        } else {
          dying = true;
          outcomes.push(new Outcome({
            type: Outcome.type.DIE,
            position: outcomes.getLastRecordedPosition(),
            unit: outcomes.getUnitType(),
            score: -1
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

  function forkDetails(outcomes, forks) {
    var alive = outcomes.unitIsAlive();
    var unit = outcomes.getUnitType();
    var team = unit.substr(0, 3);
    var myFork = team === 'sub' ? forks[0] : forks[1];
    var otherFork = team === 'sub' ? forks[1] : forks[0];
    var carrying = otherFork.get('carried') && otherFork.get('unit') === unit;
    var lastPosition = outcomes.getLastRecordedPosition();

    return {
      alive: alive,
      unit: unit,
      team: team,
      myFork: myFork,
      otherFork: otherFork,
      carrying: carrying,
      lastPosition: lastPosition,
      standingOverMyFork: !myFork.get('carried') && lastPosition.equals(myFork.get('position')),
      standingOverOtherFork: !otherFork.get('carried') && lastPosition.equals(otherFork.get('position'))
    };
  }

  function resolveForkPickupForAll(moveList, outcomeList, forks, map) {
    _.each(moveList, function(move, index) {
      var outcomes = outcomeList[index];
      var details = forkDetails(outcomes, forks);

      if (!details.standingOverOtherFork ||
          details.carryingFork ||
          !details.alive) {
        outcomes.push({
          type: Outcome.type.WAIT,
          unit: details.unit,
          position: details.lastPosition
        });
      } else {
        details.otherFork.set('unit', details.unit);
        details.otherFork.set('carried', true);
        details.otherFork.set('position', null);
        outcomes.push({
          type: Outcome.type.PICKUP_FORK,
          unit: details.unit,
          position: details.lastPosition
        });
      }
    });
  }

  function resolveForkReturnForAll(moveList, outcomeList, forks, map) {
    _.each(moveList, function(move, index) {
      var outcomes = outcomeList[index];
      var details = forkDetails(outcomes, forks);

      if (!details.standingOverMyFork ||
          !details.alive ||
          details.myFork.get('carried') ||
          details.lastPosition.equals(details.myFork.get('origin'))) {
        outcomes.push({
          type: Outcome.type.WAIT,
          unit: details.unit,
          position: details.lastPosition
        });
      } else {
        console.log('Returning fork...');
        details.myFork.set('position', details.myFork.get('origin').clone());
        outcomes.push({
          type: Outcome.type.RETURN_FORK,
          unit: details.unit,
          position: details.lastPosition,
          score: 4
        });
      }
    });
  }

  function resolveForkCaptureForAll(moveList, outcomeList, forks, map) {
    _.each(moveList, function(move, index) {
      var outcomes = outcomeList[index];
      var details = forkDetails(outcomes, forks);

      if (!details.alive ||
          details.myFork.get('carried') ||
          !details.otherFork.get('carried') ||
          details.otherFork.get('unit') !== details.unit ||
          !details.lastPosition.equals(details.myFork.get('origin'))) {
        outcomes.push({
          type: Outcome.type.WAIT,
          unit: details.unit,
          position: details.lastPosition
        });
      } else {
        details.myFork.set({
          position: details.myFork.get('origin').clone(),
          carried: false,
          unit: null
        });
        details.otherFork.set({
          position: details.otherFork.get('origin').clone(),
          carried: false,
          unit: null
        });
        outcomes.push({
          type: Outcome.type.CAPTURE_FORK,
          unit: details.unit,
          position: details.lastPosition,
          score: 35
        });
      }
    });
  }

  function resolveForkDropForAll(moveList, outcomeList, forks, map) {
    _.each(moveList, function(move, index) {
      var outcomes = outcomeList[index];
      var details = forkDetails(outcomes, forks);

      if (details.alive || !details.carrying) {
        outcomes.push({
          type: Outcome.type.WAIT,
          unit: details.unit,
          position: details.lastPosition
        });
      } else {
        details.otherFork.set({
          position: details.lastPosition,
          carried: false,
          unit: null
        });
        outcomes.push({
          type: Outcome.type.DROP_FORK,
          unit: details.unit,
          position: details.lastPosition
        });
      }
    });
  }

  function restartAllInterrupted(moveList, outcomeList, forks, map) {
    _.each(moveList, function(move, index) {
      var outcomes = outcomeList[index];
      var alive = outcomes.unitIsAlive();
      var shielded;

      if (canPerformMovement(move, outcomes)) {
        shielded = outcomes.unitIsShielded();
        outcomes.push(new Outcome({
          type: shielded ? Outcome.type.MOVE_SHIELDED : Outcome.type.MOVE,
          unit: outcomes.getUnitType(),
          position: outcomes.getLastRecordedPosition()
        }));
      } else {
        outcomes.push(new Outcome({
          type: Outcome.type.WAIT,
          unit: outcomes.getUnitType(),
          position: outcomes.getLastRecordedPosition()
        }));
      }
    });
  }

  function positionIsAvailable(position, outcomeList, forks, map) {
    var available = true;

    if (!position) {
      return false;
    }

    _.each(outcomeList, function(outcomes) {
      var blockedPosition = outcomes.getLastRecordedPosition();

      if (position.equals(blockedPosition)) {
        available = false;
      }
    });

    if (available && forks) {
      _.each(forks, function(fork) {
        if (fork.get('carried')) {
          return;
        }

        if (position.equals(fork.get('position'))) {
          available = false;
        }
      });
    }

    if (available && map) {
      var tile = map.tiles[World.prototype.positionToIndex.call({
        width: map.width,
        height: map.height
      }, position)];

      if (tile === World.tile.SUB_FORK ||
          tile === World.tile.RKT_FORK ||
          tile === World.tile.WALL) {
        available = false;
      }
    }

    return available;
  }

  function respawnDeadUnits(moveList, outcomeList, forks, map) {
    _.each(moveList, function(move, index) {
      var outcomes = outcomeList[index];
      var respawnPosition;
      if (outcomes.unitDiedAtSomePoint()) {
        while (!positionIsAvailable(respawnPosition, outcomeList, forks, map)) {
          respawnPosition = new Vector2();
          if (move.get('unit').substr(0, 3) === 'rkt') {
            respawnPosition.x = map.width - 1;
          }
          respawnPosition.y = Math.ceil(Math.random() * (map.height - 2));
        }
        outcomes.push(new Outcome({
          unit: move.get('unit'),
          type: Outcome.type.RESPAWN,
          position: respawnPosition
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
      resolveForkPickupForAll(moveList, outcomeList, forks, map);
      resolveForkReturnForAll(moveList, outcomeList, forks, map);
      resolveForkCaptureForAll(moveList, outcomeList, forks, map);
      resolveAttacksForAll(moveList, outcomeList, forks, map);
      resolveDefenseForAll(moveList, outcomeList, forks, map);
      resolveForkDropForAll(moveList, outcomeList, forks, map);
      restartAllInterrupted(moveList, outcomeList, forks, map);
    }

    respawnDeadUnits(moveList, outcomeList, forks, map);

    return outcomeList;
  }

  return {
    resolve: resolve
  };
});

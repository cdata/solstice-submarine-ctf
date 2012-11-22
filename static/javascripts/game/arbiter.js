if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define('game/arbiter',
       ['underscore', 'game/outcome'],
       function(_, OutcomeModel) {
  function direction(from, to) {
    // returns direction given a move from one pos to another
  }

  function lineOfSight(from, to, map) {
    // returns true if from has line of sight with to on map
  }

  function moveCompleted(move, outcome) {
    return move.get('points').length > outcome.get('points').length && !outcome.get('dies') && !outcome.get('attacks');
  }

  function hasMove(moves, outcomes) {
    return _.any(moves, function(move, index) {
      var outcome = outcomes[index];
      return !moveCompleted(move, outcome);
    });
  }

  function advance(move, outcome) {
    if (!moveCompleted(move, outcome)) {
      outcome.addPointFromMove(move);
    }
  }

  function advanceAll(moves, outcomes) {
    _.each(moves, function(move, index) {
      advance(move, outcomes[index]);
    });
  }

  function checkStateOfAll(moves, outcomes) {
    _.each(moves, function(move, index) {
      
    });
  }

  function resolve(moves, map) {
    var p1OutcomeA = new OutcomeModel();
    var p1OutcomeB = new OutcomeModel();
    var p2OutcomeA = new OutcomeModel();
    var p2OutcomeB = new OutcomeModel();
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

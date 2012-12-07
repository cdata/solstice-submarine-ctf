define(['underscore', 'game/client', 'collection/game/outcome', 'model/game/move', 'game/arbiter', 'game/assets', 'model/game/fork', 'game/world', 'game/vector2'],
       function(_, Client, OutcomeCollection, Move, Arbiter, Assets, Fork, World, Vector2) {
  return Client.extend({
    connect: function() {
      this.connection = {
        emit: _.bind(this.proxyEmit, this),
        on: _.bind(this.proxyOn, this),
        removeAllListeners: _.bind(this.proxyOff, this),
        disconnect: _.bind(this.proxyDisconnect, this)
      };
      this.onStart('rkt');
    },
    dispose: function() {
      Client.prototype.dispose.apply(this, arguments);
    },
    disconnect: function() {
      this.connection = null;
    },
    proxyEmit: function(event, data, callback) {
      var args = Array.prototype.slice.call(arguments, 1);
      switch (event) {
        case 'turn':
          this.handleTurn.apply(this, args);
          break;
      }
    },
    proxyOn: function() {},
    proxyOff: function() {},
    proxyDisconnect: function() {},
    disconnect: function() {},
    handleTurn: function(data, callback) {
      var game = JSON.parse(data);
      var turn = game.turn;
      var forks = [new Fork(game.forks[0]), new Fork(game.forks[1])];
      var result = Arbiter.resolve([
        game.team === 'sub' ? new Move(turn.moveA) :
                              this.getOpponentMove(Move.unit.SUB_A, forks, this.interface.world),

        game.team === 'sub' ? new Move(turn.moveB) :
                              this.getOpponentMove(Move.unit.SUB_B, forks, this.interface.world),

        game.team === 'rkt' ? new Move(turn.moveA) :
                              this.getOpponentMove(Move.unit.RKT_A, forks, this.interface.world),

        game.team === 'rkt' ? new Move(turn.moveB) :
                              this.getOpponentMove(Move.unit.RKT_B, forks, this.interface.world)
      ], forks, Assets.getData('assets/data/maps/seabound.json'));
      var outcomeList = result;

      _.defer(_.bind(function() {
        callback();
        _.defer(_.bind(function() {
          this.onOutcome(JSON.stringify(outcomeList)); }, this));
      }, this));
    },
    getOpponentMove: function(unit, forks, world) {
      // Badass AI yo..
      var world = this.interface.world;
      var entity = world[unit];
      var newPosition = entity.position.clone();
      var otherFork = /sub/.test(unit) ? forks[1] : forks[0];
      var myFork = /rkt/.test(unit) ? forks[1] : forks[0];
      var carrier;
      var chance;
      var index;
      var position;
      var path;

      if (unit === 'rktA' || unit === 'subA') {
        chance = 0.15;
      } else {
        chance = 0.85;
      }

      if (Math.random() < chance) {
        do {
          index = Math.floor(Math.random() * world.width * world.height);
          position = world.indexToPosition(index);
        } while (world.is(position, World.tile.WALL));
      } else {
        if (!otherFork.get('carried')) {
          position = new Vector2().copy(otherFork.get('position'));
        } else if (!myFork.get('carried')) {
          position = new Vector2().copy(myFork.get('position'));
        } else {
          carrier = world[myFork.get('unit')];
          position = carrier.position.clone();
        }
      }

      path = world.getPath(entity.position, position);
      path = path.slice(0, 4);

      return new Move({
        unit: unit,
        shielded: false,
        start: entity.position.clone(),
        points: path
      });
    }
  });
});

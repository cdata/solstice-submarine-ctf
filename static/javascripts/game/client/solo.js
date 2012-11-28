define('game/client/solo',
       ['underscore', 'game/client', 'collection/game/outcome', 'model/game/move', 'game/arbiter', 'game/assets', 'model/game/fork', 'game/world'],
       function(_, Client, OutcomeCollection, Move, Arbiter, Assets, Fork, World) {
  return Client.extend({
    connect: function() {
      this.connection = {
        emit: _.bind(this.proxyEmit, this),
        on: _.bind(this.proxyOn, this),
        removeAllListeners: _.bind(this.proxyOff, this),
        disconnect: _.bind(this.proxyDisconnect, this)
      };
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
      var result = Arbiter.resolve([
        new Move(turn.moveA), new Move(turn.moveB),
        this.getOpponentMove(Move.unit.RKT_A, this.interface.world),
        this.getOpponentMove(Move.unit.RKT_B, this.interface.world)
      ], [new Fork(game.forks[0]), new Fork(game.forks[1])], Assets.getData('assets/data/maps/seabound.json'));
      var outcomeList = result;

      _.defer(_.bind(function() {
        callback();
        _.defer(_.bind(function() {
          this.onOutcome(JSON.stringify(outcomeList)); }, this));
      }, this));
    },
    getOpponentMove: function(unit, world) {
      // Badass AI yo..
      var world = this.interface.world;
      var entity = world[unit];
      var newPosition = entity.position.clone();
      var index;
      var position;
      var path;

      do {
        index = Math.floor(Math.random() * world.width * world.height);
        position = world.indexToPosition(index);
      } while (world.is(position, World.tile.WALL));

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

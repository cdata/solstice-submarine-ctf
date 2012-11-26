define('game/client/solo',
       ['underscore', 'game/client', 'collection/game/outcome', 'model/game/move', 'game/arbiter', 'game/assets'],
       function(_, Client, OutcomeCollection, Move, Arbiter, Assets) {
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
      var turn = JSON.parse(data);
      var outcomeList = Arbiter.resolve([
        new Move(turn.moveA), new Move(turn.moveB),
        this.getOpponentMove(Move.unit.RKT_A),
        this.getOpponentMove(Move.unit.RKT_B)
      ], null, Assets.getData('assets/data/map/seabound.json'));

      _.defer(_.bind(function() {
        callback();
        _.defer(_.bind(function() {
          this.onOutcome(JSON.stringify(outcomeList)); }, this));
      }, this));
    },
    getOpponentMove: function(unit) {
      var world = this.interface.world;
      var entity = world[unit];
      var newPosition = entity.position.clone();

      if (newPosition.x % 2 === 0) {
        newPosition.x = newPosition.x + 1;
      } else {
        newPosition.x = newPosition.x - 1;
      }

      return new Move({
        unit: unit,
        points: [
          newPosition
        ]
      });
    }
  });
});

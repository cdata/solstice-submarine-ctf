define('game/client/solo',
       ['underscore', 'game/client', 'collection/game/outcome'],
       function(_, Client, OutcomeCollection) {
  return Client.extend({
    connect: function() {
      this.connection = {
        emit: _.bind(this.proxyEmit, this),
        on: _.bind(this.proxyOn, this),
        off: _.bind(this.proxyOff, this)
      }
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
    disconnect: function() {},
    handleTurn: function(data, callback) {
      var turn = JSON.parse(data);
      var outcomes = new OutcomeCollection();

      outcomes.add({
        unit: 'subA',
        points: turn.moveA.points,
        shielded: turn.moveA.shielded
      });

      outcomes.add({
        unit: 'subB',
        points: turn.moveB.points,
        shielded: turn.moveB.shielded
      });

      _.defer(_.bind(function() {
        callback();
        _.defer(_.bind(function() {
          this.onOutcome(outcomes.toJSON());
        }, this));
      }, this));
    }
  });
});

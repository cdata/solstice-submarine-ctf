if (typeof define !== 'function') {
  var define = require('amdefine')(module)
}

define(['underscore', 'game/object', 'game/interface', 'io', 'collection/game/outcome', 'model/game/fork'],
       function(_, GameObject, Interface, io, OutcomeCollection, ForkModel) {
  return GameObject.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {

      });
      this.model = options.model;
      this.model.set('forks', [
        new ForkModel({
          team: 'sub'
        }),
        new ForkModel({
          team: 'rkt'
        })
      ]);
      this.renderer = options.renderer;
      this.ui = options.ui;
      this.interface = new Interface({
        scene: this.renderer.sceneRoot,
        model: this.model,
        ui: this.ui,
        subFork: this.subFork,
        rktFork: this.rktFork
      });
      this.interface.disableInteraction();
      this.ui.showMessage('Connecting to server..');
      this.model.on('change:turn', this.submitTurn, this);
      this.connect();
    },
    dispose: function() {
      this.connection.disconnect();
      this.connection.removeAllListeners();
      this.connection = null;
      this.renderer = null;
      this.interface.dispose();
      this.interface = null;
      this.ui = null;
      this.model = null;
    },
    connect: function() {
      //this.connection = io.connect('https://socket.solsticesub.com');
      this.connection = io.connect('http://localhost:9001');
      this.connection.on('connect', _.bind(this.onConnected, this));
      this.connection.on('disconnect', _.bind(this.onDisconnected, this));
      this.connection.on('message', _.bind(this.onMessage, this));
      this.connection.on('outcome', _.bind(this.onOutcome, this));
      this.connection.on('start', _.bind(this.onStart, this));
      this.model.set('connected', true);
      this.ui.showMessage('Waiting for opponent to connect..');
    },
    submitTurn: function() {
      var turn = this.model;

      if (!turn) {
        return;
      }

      this.connection.emit('turn',
                           JSON.stringify(turn.toJSON()),
                           _.bind(this.onReceivedTurn, this));
      this.ui.showMessage('Waiting for server..');
    },
    onReceivedTurn: function() {
      this.ui.showMessage('Waiting for opponent..');
    },
    onResolvingOutcome: function() {
      this.ui.showMessage('Resolving outcome..');
    },
    onOutcome: function(outcomeList) {
      outcomeList = _.map(JSON.parse(outcomeList), function(outcomes) {
        return new OutcomeCollection(outcomes);
      });
      this.ui.showMessage('Performing moves..');
      this.interface.performOutcomes(outcomeList);
    },
    onConnected: function() {
      console.log('Connected!');
      this.model.set('connected', true);
    },

    onDisconnected: function() {
      this.model.set('connected', false);
    },
    onMessage: function(message) {
      console.log('Message:', message);
    },
    onStart: function(team) {
      this.model.set('team', team);
      //this.ui.hideMessage();
      //this.interface.enableInteraction();
    }
  });
});

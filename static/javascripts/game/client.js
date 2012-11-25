define('game/client',
       ['underscore', 'game/object', 'game/interface', 'io', 'collection/game/outcome'],
       function(_, GameObject, Interface, io, OutcomeCollection) {
  return GameObject.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {

      });
      this.model = options.model;
      this.renderer = options.renderer;
      this.ui = options.ui;
      this.interface = new Interface({
        scene: this.renderer.sceneRoot,
        model: this.model,
        ui: this.ui
      });
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
    },
    connect: function() {
      this.connection = io.connect('https://socket.solsticesub.com');
      this.connection.on('connect', _.bind(this.onConnected, this));
      this.connection.on('disconnect', _.bind(this.onDisconnected, this));
      this.connection.on('message', _.bind(this.onMessage, this));
      this.connection.on('outcome', _.bind(this.onOutcome, this));
    },
    submitTurn: function() {
      var turn = this.model.get('turn');

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
    onOutcome: function(outcomes) {
      outcomes = new OutcomeCollection(outcomes);
      this.ui.showMessage('Performing moves..');
      this.interface.performOutcomes(outcomes);
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
    }
  });
});
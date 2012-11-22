define('game/client',
       ['underscore', 'game/object', 'game/interface', 'io'],
       function(_, GameObject, Interface, io) {
  return GameObject.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {

      });
      this.model = options.model;
      this.renderer = options.renderer;
      this.interface = new Interface({
        scene: this.renderer.sceneRoot,
        model: this.model
      });
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

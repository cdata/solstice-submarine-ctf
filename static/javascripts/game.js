define('game', 
       ['underscore', 'game/object', 'game/renderer', 'game/engine', 'game/client', 'game/client/solo', 'model/game'],
       function(_, GameObject, Renderer, Engine, Client, SoloClient, GameModel) {
  var Game = GameObject.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        solo: true
      });
      this.solo = options.solo;
      this.model = new GameModel();
      this.ui = options.ui;
    },
    dispose: function() {
      this.renderer.dispose();
      this.engine.dispose();
      this.client.dispose();

      this.renderer = null;
      this.engine = null;
      this.client = null;
    },
    start: function() {
      this.renderer = new Renderer();

      if (this.solo) {
        this.client = new SoloClient({
          renderer: this.renderer,
          model: this.model,
          ui: this.ui
        });
      } else {
        this.client = new Client({
          renderer: this.renderer,
          model: this.model,
          ui: this.ui
        });
      }

      this.engine = new Engine();
      this.engine.on('render', this.renderer.render, this.renderer);
      this.engine.start();
    }
  });

  return Game;
});

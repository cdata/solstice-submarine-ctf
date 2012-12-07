define(['underscore', 'game/object', 'game/renderer', 'game/engine', 'game/client', 'game/client/solo', 'model/game', 'game/music'],
       function(_, GameObject, Renderer, Engine, Client, SoloClient, GameModel, Music) {
  var Game = GameObject.extend({
    initialize: function(options) {
      options = _.defaults(options || {}, {
        online: false
      });
      this.online = options.online;
      this.model = new GameModel();
      this.ui = options.ui;
      this.music = new Music();
    },
    dispose: function() {
      this.client && this.client.dispose();
      this.renderer.dispose();
      this.engine.dispose();
      this.music.dispose();

      this.model.off(null, null, this);

      this.renderer = null;
      this.engine = null;
      this.client = null;
      this.ui = null;
      this.model = null;
      this.music = null;
    },
    start: function() {
      this.renderer = new Renderer();

      if (this.online) {
        console.log('Starting new online game..');
        this.client = new Client({
          renderer: this.renderer,
          model: this.model,
          ui: this.ui
        });
      } else {
        console.log('Starting new solo game..');
        this.client = new SoloClient({
          renderer: this.renderer,
          model: this.model,
          ui: this.ui
        });
      }

      this.engine = new Engine();
      this.engine.on('render', this.renderer.render, this.renderer);
      this.engine.start();

      this.music.play();
    }
  });

  return Game;
});
